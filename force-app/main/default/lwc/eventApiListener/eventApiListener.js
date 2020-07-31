import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';


export default class EventApiListener extends LightningElement {
    channelName = '/event/Water_Level_Reading__e';
    isSubscribeDisabled = false;
    isUnsubscribeDisabled = !this.isSubscribeDisabled;
    show = true;

    subscription = {};

    events = [];
    myID = 0;

    handleChannelName(event) {
        this.channelName = event.target.value;
    }

    connectedCallback() {
        this.registerErrorListener();
    }

    handleSubscribe() {
        let that = this;

        const messageCallback = (response) => {
            console.log('New message received: ', JSON.stringify(response));
            const objStr = JSON.stringify(response);
            const obj = JSON.parse(objStr);
            let mySensor = obj.data.payload.Sensor_Name__c;
            let myDateTime = obj.data.payload.DateTime__c;
            let myTide = obj.data.payload.Predicted_Height__c;
            let myLevel = obj.data.payload.Preliminary_Height__c;
            let myArray = myDateTime + ": " + mySensor + " Height: " + myLevel + " Tide: " + myTide;
            that.events.unshift(myArray);
            that.myID +=1;
            that.showToast(myDateTime, mySensor);
        };

        subscribe(this.channelName, -1, messageCallback).then(response => {
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
            this.toggleSubscribeButton(true);
        });
    }

    handleUnsubscribe() {
        this.toggleSubscribeButton(false);
        
        unsubscribe(this.subscription, response => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
        });
    }

    toggleSubscribeButton(enableSubscribe) {
        this.isSubscribeDisabled = enableSubscribe;
        this.isUnsubscribeDisabled = !enableSubscribe;
    }

    registerErrorListener() {
        onError(error => {
            console.log('Recieved error from server: ', JSON.stringify(error));
        });
    }

    showToast(toastTitle, toastMessage) {
        const event = new ShowToastEvent({
            title: toastTitle,
            message: toastMessage
        });
        this.dispatchEvent(event);
    }
}


