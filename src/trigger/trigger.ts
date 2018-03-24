import nem from "nem-sdk";
import {YA_ADDRESS, NODE_URL, PRIV_KEY} from "../config";
import {Transaction} from "../transaction/transaction";
import {Util} from "../util/util";

export class Trigger {
    websockets:any;
    address = "";
    node_url = "";
    priv_key = "";
    network_id:number;
    transaction = new Transaction();
    util = new Util();

    constructor() {
        console.log("websocket init");
        this.initApp();
        this.util.asyncSetup();
    }

    initApp(){
        this.address = YA_ADDRESS;
        this.node_url = NODE_URL;
        this.priv_key = PRIV_KEY;
        this.network_id = nem.model.network.data.testnet.id;
        this.websockets = nem.model.objects.create("endpoint")(this.node_url, nem.model.nodes.websocketPort);
    }
    connector(){
        console.log("websocket start...");
        // Testnet用
        var connector = nem.com.websockets.connector.create(this.websockets, this.address);
        connector.connect().then(()=> {
            nem.com.websockets.subscribe.account.transactions.confirmed(connector, (res)=> {
                console.log(res);
                this.chkTransaction(res);
            })
        },
        err => {
            console.error(err);
        });
    }
    chkTransaction(res){
        let send_address = this.util.getSendAddress(res.transaction);
        let signer_address = this.util.getSendSignerAddress(res.transaction);
        let hash = this.util.getHash(res.meta);
        let amount = this.util.getAmount(res.transaction);
        if(this.validSendAddress(send_address) && this.validSignerAddress(signer_address) && this.validAmount(amount)){
            console.log("success");
            amount = this.calcRepaymentAmount(amount);
            this.transaction.sendTransactions(send_address, 0, hash, 100);
        }else{
            console.log("failed");
        }
    }
    validSendAddress(address){
        if(address !== ''){
            if(address != this.address){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    validSignerAddress(address){
        if(address !== ''){
            if(address != this.address){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    validAmount(amount){
        if(amount >= this.util.getCalcAmount(1000000)){
            return true;
        }else{
            return false;
        }
    }
    calcRepaymentAmount(amount){
        return amount -  this.util.getCalcAmount(1500000);
    }
}

