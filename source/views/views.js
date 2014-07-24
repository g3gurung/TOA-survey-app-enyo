/**
 For simple applications, you might define all of your views in this file.  
 For more complex applications, you might choose to separate these kind definitions 
 into multiple files under this folder.
 */

enyo.kind({
    name: "myapp.MainView",
    kind: "FittableRows",
    classes: "onyx enyo-fit",
    published: {
        "inputControls": [],
        "session_id": null
    },
    components: [
        {kind: "app_header",
            components: [
                {kind: "Image", src: "assets/images/logo.png", classes: "header-logo"}
            ]},
        {kind: "Panels", realtimeFit: true, fit: true, classes: "panels-sample-sliding-panels", 
            arrangerKind: "CollapsingArranger", wrap: false, draggable: false, components: [
                {name: "first", components: [
                        {kind: "Scroller", name: "firstScroller",
                            classes: "enyo-fit", horizontal: "hidden",
                            touch: true, components: [
                                {name: "firstRepeater", item: "item", kind: "Repeater", 
                                    onSetupItem: "setupItem", style: "padding-top: 1em",
                                    components: [
                                        {name: "item", style: "position: relative; margin-bottom: 10px; border-bottom: 1px solid grey; padding: 10px", 
                                            val: null, components: [
                                            {kind: "itemHeader"},
                                            {name: "itemInputControl",
                                                sliderChanging: function(inSender, inEvent) {
                                                    this.bubbleUp("onChanging", inEvent, inSender);
                                                },
                                                groupActivated: function(inSender, inEvent) {
                                                    if(inSender.owner.owner.$.itemHeader.$
                                                            .itemResetBtn.getAttributes().disabled) {
                                                        inSender.owner.owner.$.itemHeader.$
                                                            .itemResetBtn.setAttribute("disabled", false);
                                                    }
                                                    inSender.owner.owner.$.itemInputControl.$.inputCheckBox.val = inEvent.originator.val;
                                                    var ready = true;
                                                    for(var i = 0; i < this.owner.owner.owner.$.firstRepeater.getCount(); i++) {
                                                        if(this.owner.owner.owner.$.firstRepeater.children[i].$
                                                            .itemHeader.$.itemResetBtn.getAttributes().disabled) {
                                                            ready = false;
                                                        }
                                                    }
                                                    if(ready){
                                                        this.owner.owner.owner.$.submitBtn.setDisabled(false);
                                                    }
                                                }
                                            },
                                            {kind: "sliderInfo", showing: false}
                                        ]}
                                    ]
                                },
                                {
                                    style: "text-align: center; margin-bottom: 1em",
                                    components: [
                                        {name:"submitBtn", kind: "onyx.Button", content: "Done", 
                                            classes: "onyx-dark", disabled: true,
                                            ontap: "submitBtnTapped"}
                                    ]
                                }
                            ]}
                        ]},
                {name: "second", components: [
                        {kind: "Scroller", name: "secondScroller",
                            classes: "enyo-fit", horizontal: "hidden",
                            touch: true, components: [
                                {name:"secondContainer", kind: "secondContent"}
                            ]
                        }
                    ]}
            ]}
    ],
    handlers: {
        onChanging: "sliderChanging",
        ontap: "resetInputControl"
    },
    rendered: function() {
        this.inherited(arguments);

        var ajax = new enyo.Ajax({
            url: "/json/inputControls.json",
            method: "GET"
        });
        // send parameters the remote service using the 'go()' method
        ajax.go();
        // attach responders to the transaction object
        ajax.response(this, "processResponse");
        // handle error
        ajax.error(this, "processError");
    },
    processResponse: function(inSender, inResponse) {
        this.setInputControls(inResponse);
        this.$.firstRepeater.setCount(this.getInputControls().length);
    },
    processError: function(inSender, inResponse) {
        //error handling code
    },
    setupItem: function(inSender, inEvent) {
        var i = inEvent.index;
        var item = inEvent.item;
        item.$.itemHeader.$.itemHeaderContent
                .setContent(this.getInputControls()[i].q_id + ". " + this.getInputControls()[i].question);
        item.$.itemHeader.$.itemResetBtn.setAttribute("disabled", true);

        if (this.getInputControls()[i].type === "slider") {
            item.$.itemInputControl.createComponent({
                name: "inputSlider", lockBar: false, tappable: false,
                kind: "onyx.Slider", value: 50, q_id: this.getInputControls()[i].q_id,
                events: {
                    onChanging: "sliderChanging", onChange: "sliderChanged"
                }
            },{owner: item.$.itemInputControl});
            item.$.itemInputControl.render();
            item.$.sliderInfo.$.infoLeft
                    .setContent(this.getInputControls()[i].slider_info.left);
            item.$.sliderInfo.$.infoRight
                    .setContent(this.getInputControls()[i].slider_info.right);
            item.$.sliderInfo.setShowing(true);
        } else if (this.getInputControls()[i].type === "checkbox") {
            item.$.itemInputControl.createComponent({
                kind: "Group", onActivate: "groupActivated", name: "inputCheckBox",
                val: null,
                q_id: this.getInputControls()[i].q_id
            });
            item.$.itemInputControl.render();
            for (var x = 0; x < this.getInputControls()[i].checkboxes.length; x++) {
                item.$.itemInputControl.$.inputCheckBox.createComponents(
                        [
                            {kind: "onyx.Checkbox", val: this.getInputControls()[i].checkboxes[x]},
                            {tag: "span", content: this.getInputControls()[i].checkboxes[x], style: "margin-right: 1em"}
                        ], {owner: item.$.itemInputControl.$.inputCheckBox}
                );
                item.$.itemInputControl.$.inputCheckBox.render();
            }
        }
        return true;
    },
    sliderChanging: function(inSender, inEvent) {
        if(inSender.owner.$.firstRepeater.children[inEvent.index].$
                .itemHeader.$.itemResetBtn.getAttributes().disabled) {
            inSender.owner.$.firstRepeater.children[inEvent.index].$
                .itemHeader.$.itemResetBtn.setAttribute("disabled", false);
        }
        inSender.owner.$.firstRepeater.children[inEvent.index].$
                .itemInputControl.$.inputSlider.setLockBar(true);
        inSender.owner.$.firstRepeater.children[inEvent.index].$
                .itemInputControl.$.inputSlider.$.knob.addRemoveClass("active", true);
        
        
        var ready = true;
        for(var i = 0; i < this.$.firstRepeater.getCount(); i++) {
            if(inSender.owner.$.firstRepeater.children[i].$
                .itemHeader.$.itemResetBtn.getAttributes().disabled) {
                ready = false;
            }
        }
        if(ready){
            this.$.submitBtn.setDisabled(false);
        }
        return true;
    },
    resetInputControl: function(inSender, inEvent) {
        if(inEvent.originator.name === "itemResetBtn") {
            this.$.firstRepeater.children[inEvent.index].$.itemInputControl.destroyComponents();
            this.$.firstRepeater.renderRow(inEvent.index);
            this.$.submitBtn.setDisabled(true);
        }
        return true;
    },
    submitBtnTapped: function(inSender, inEvent) {
        
        var reqArray = [];
        for(var i = 0; i < this.getInputControls().length; i++) {
            if(this.getInputControls()[i].type === "slider") {
                if(this.getInputControls()[i].q_id === this.$.firstRepeater.children[i].$.itemInputControl.$.inputSlider.q_id) {
                    reqArray.push({q_id: this.$.firstRepeater.children[i].$.itemInputControl.$.inputSlider.q_id,
                        value: this.$.firstRepeater.children[i].$.itemInputControl.$.inputSlider.getValue()});
                }
            } else if (this.getInputControls()[i].type === "checkbox") {
                if(this.getInputControls()[i].q_id === this.$.firstRepeater.children[i].$.itemInputControl.$.inputCheckBox.q_id) {
                    reqArray.push({q_id: this.$.firstRepeater.children[i].$.itemInputControl.$.inputCheckBox.q_id,
                        value: this.$.firstRepeater.children[i].$.itemInputControl.$.inputCheckBox.val});
                }
            }
        }
        var params = JSON.stringify({"sess_id": this.getSession_id(), "surveyData": reqArray});
        // send parameters the remote service using the 'go()' method
        var ajax = new enyo.Ajax({
            url: "/services/processSurvey.php",
            method: "post",
            contentType: 'application/x-www-form-urlencoded',
            postBody: params
        });
        ajax.go();
        // attach responders to the transaction object
        ajax.response(this, "processSubmitResponse");
        // handle error
        ajax.error(this, "processSubmitError");
    },
    processSubmitResponse: function(inSender, inResponse) {
        this.$.secondContainer.$.ajaxResponseTxt
                .children[0].setContent(inResponse.responseTxt);
        this.$.panels.setIndex(1);
        this.setSession_id(inResponse.session_id);
    },
    processSubmitError: function(inSender, inResponse) {
        this.$.secondContainer.$.ajaxResponseTxt
                .children[0].setContent(inResponse.responseTxt);
        this.$.secondContainer.$.ajaxResponseTxt
                .children[0].applyStyle("color","#8a6d3b");
        this.$.panels.setIndex(1);
        this.setSession_id(inResponse.session_id);
    }
});

//enyo header
enyo.kind({
    name: "app_header",
    classes: "app-header",
    allowHtml: true
});

//enyo kind for secondContent
enyo.kind({
    name: "secondContent",
    classes: "second-content",
    components: [
        {name: "ajaxResponseTxt", components: [
                {tag: "h1", classes: "second-content-h1"}
        ]},
        {name: "editBtn", style: "text-align: center", 
            components: [
                {kind: "onyx.Button", content: "Edit", classes: "onyx-dark",
                    ontap: "editBtnTapped"}
        ]},
        {kind: "enyo.Anchor", name: "copyRight", classes: "copyright-info",
            href: "http://fi.linkedin.com/pub/prataksha-gurung/66/4a7/758", 
            title: "Copyright info", attributes: {target: "_blank"}, content: "© Prataksha Gurung"}
    ],
    editBtnTapped: function(inSender, inEvent) {
        this.owner.$.panels.setIndex(0);
    }
});

//enyo kind for itemHeader
enyo.kind({
    name: "itemHeader",
    style: "margin-bottom: 20px; margin-top: 20px",    
    components: [
        {name: "itemHeaderContent", classes: "item-header-content"},
        {name: "itemResetBtn", kind: "onyx.Button",
            tag: "button",
            content: "Reset",
            classes: "reset-btn",
            ontap: "resetInputControl"
        }
    ],
    resetInputControl: function(inSender, inEvent) {
        this.bubbleUp("ontap", inEvent, inSender);
    }
});
/*
//enyo kind for submitBtn
enyo.kind({
    name: "submitBtn", 
    components: [
        {kind: "onyx.Button", content: "Done", classes: "onyx-dark",
            ontap: "submitBtnTapped", disabled: true}
    ],
    submitBtnTapped: function(inSender, inEvent) {
        var ajax = new enyo.Ajax({
            url: "resources/survey.json",
            method: "post"
        });
        // send parameters the remote service using the 'go()' method
        ajax.go();
        // attach responders to the transaction object
        ajax.response(this, "processSubmitResponse");
        // handle error
        ajax.error(this, "processSubmitError");
    },
    processSubmitResponse: function(inSender, inResponse) {
        this.owner.$.secondContainer.$.ajaxResponseTxt
                .children[0].setContent(inResponse);
        this.owner.$.panels.setIndex(1);
    },
    processSubmitError: function(inSender, inResponse) {
        this.owner.$.secondContainer.$.ajaxResponseTxt
                .children[0].setContent(inResponse);
        this.owner.$.secondContainer.$.ajaxResponseTxt
                .children[0].applyStyle("color","#8a6d3b");
        this.owner.$.panels.setIndex(1);
    }
});
*/
//enyo kind for sliderInfo
enyo.kind({
    name: "sliderInfo",
    components: [
        {name: "infoLeft", tag: "span"},
        {name: "infoRight", tag: "span", style: "float: right"}
    ]
});