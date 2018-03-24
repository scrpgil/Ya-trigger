import nem from "nem-sdk";
import {PRIV_KEY} from "./config";
import {Trigger} from "./trigger/trigger";

class Main {
    trigger = new Trigger();
    constructor() {
        this.trigger.connector();
    }
}

const main = new Main();
