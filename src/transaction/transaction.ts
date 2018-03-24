import nem from "nem-sdk";
import { Util } from '../util/util';
import {YA_ADDRESS, NODE_URL, PRIV_KEY} from "../config";

export class Transaction {
    endpoint:any;
    address = "";
    node_url = "";
    priv_key = "";
    network_id:number;
    util = new Util();

    constructor() {
        console.log("transaction init");
        this.initApp();
    }

    initApp(){
        this.address = YA_ADDRESS;
        this.node_url = NODE_URL;
        this.priv_key = PRIV_KEY;
        this.endpoint = nem.model.objects.create("endpoint")(this.node_url, nem.model.nodes.defaultPort);
    }

    sendTransactions(address, amount, message:string = "" , mosaicAmount:number = 0){
        let entity = this.util.prepareTransaction(amount, address, message , mosaicAmount);
        console.log(entity);
        console.log(JSON.stringify(entity));
        this.util.send(entity);
    }
}

