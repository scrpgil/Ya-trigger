import nem from "nem-sdk";
import {YA_ADDRESS, NODE_URL, PRIV_KEY} from "../config";

export class Util {
    endpoint:any;
    mosaics:any;
    node_url:string = "";
    network_id:number;
    priv_key:string = "";
    common:any;
    xem_supply:number = 0;

    constructor() {
        console.log("util init");
        this.setup();
        this.asyncSetup();
    }
    setup(){
        this.node_url = NODE_URL;
        this.network_id = nem.model.network.data.testnet.id;
        this.priv_key = PRIV_KEY;
        this.common = nem.model.objects.create("common")("", this.priv_key);
        console.log(this.common);
    }

    async asyncSetup(){
        this.endpoint = nem.model.objects.create("endpoint")(this.node_url, nem.model.nodes.defaultPort);
        this.mosaics = await this.attachMosaics();
        for(let i = 0; i<this.mosaics.data.length;i++){
            let mosaicName = this.mosaicIdToName(this.mosaics.data[i].mosaic.id);
            let res = await this.getMosaicSupply(mosaicName);
            this.mosaics.data[i].mosaic["supply"] = res["supply"];
        }
        let res = await this.getMosaicSupply("nem:xem");
        this.xem_supply = res["supply"];
        console.log(this.mosaics);
        return Promise.resolve(true);
    }

    // モザイク定義ファイルを取得
    attachMosaics(): Promise<any>{
        let m = nem.model.objects.create("mosaicAttachment")("greeting", "ya", 0); 
        return nem.com.requests.namespace.mosaicDefinitions(this.endpoint, m.mosaicId.namespaceId);
    }
    getMosaicSupply(mosaicId): Promise<any>{
        return nem.com.requests.mosaic.supply(this.endpoint, mosaicId);
    }

    getMosaicMetaData(){
        let mosaicAttachment = nem.model.objects.create("mosaicAttachment")("greeting", "ya", 0); 
        let metaData = nem.model.objects.get("mosaicDefinitionMetaDataPair");
        let fullMosaicName  = nem.utils.format.mosaicIdToName(mosaicAttachment.mosaicId);
        let neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(this.mosaics.data, ["ya"]);
        if(undefined === neededDefinition[fullMosaicName]) return console.error("Mosaic not found !");
        metaData[fullMosaicName] = {};
        metaData[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName];
        metaData[fullMosaicName].supply = neededDefinition[fullMosaicName].supply;
        metaData["nem:xem"].supply = this.xem_supply;
        return metaData;
    }
    mosaicIdToName(mosaicId){
        return nem.utils.format.mosaicIdToName(mosaicId);
    }

    // Yaトークンの送り先アドレス。transactionのmessageに記載
    getSendAddress(transaction){
        let send_address = "";
        if(transaction.message){
            let address = nem.utils.format.hexToUtf8(transaction.message.payload);
            // AddressのValidationチェック
            let isValid = nem.model.address.isValid(String(address));
            if(isValid){
                send_address = address;
            }
        }
        return send_address;
    }
    // トランザクションの送り主を取得
    getSendSignerAddress(transaction){
        let signer_address = nem.model.address.toAddress(transaction.signer, this.network_id);
        console.log(signer_address);
        return signer_address;
    }
    // トランザクションのハッシュを取得する
    getHash(meta){
        return meta.hash.data;
    }
    // 送付されたXEMの量を取得
    getAmount(transaction){
        return this.getCalcAmount(transaction.amount);
    }
    // 送付されたXEMの量を取得
    getCalcAmount(amount){
        return amount / 1000000;
    }
    // Transaction生成
    prepareTransaction(amount, recipient:string = "", message:string = "" , mosaicsAmount:number = 0) {
        // Create a new object to not affect the view
        let cleanTransferTransaction = nem.model.objects.get("transferTransaction");

        cleanTransferTransaction.recipient = recipient;

        cleanTransferTransaction.message = message;
        cleanTransferTransaction.messageType = 1;

        let entity:any;
        if(mosaicsAmount > 0){
            cleanTransferTransaction.amount = 1;
            let xemMosaic = nem.model.objects.create("mosaicAttachment")("nem", "xem", amount);
            let yaMosaic = nem.model.objects.create("mosaicAttachment")("greeting", "ya", mosaicsAmount); 
            let metaData = this.getMosaicMetaData();
            let m = this.cleanMosaicAmounts([xemMosaic, yaMosaic],metaData);
            cleanTransferTransaction.mosaics = m;
            console.log("metaData:");
            console.log(metaData);
            console.log("m:");
            console.log(m);
            entity = nem.model.transactions.prepare("mosaicTransferTransaction")(this.common, cleanTransferTransaction, metaData, this.network_id);
        }else{
            cleanTransferTransaction.amount = amount;
            cleanTransferTransaction.mosaics = null;
            entity = nem.model.transactions.prepare("transferTransaction")(this.common, cleanTransferTransaction, this.network_id);
        }

        return entity;
    }
    cleanMosaicAmounts(elem, mosaicDefinitions) { // Deep copy: https://stackoverflow.com/a/5344074
        let copy;
        if(Object.prototype.toString.call(elem) === '[object Array]') {
            copy = JSON.parse(JSON.stringify(elem));
        } else {
            let _copy = [];
            _copy.push(JSON.parse(JSON.stringify(elem)))
            copy = _copy;
        }
        for (let i = 0; i < copy.length; i++) {
            // Check text amount validity
            if(!nem.utils.helpers.isTextAmountValid(copy[i].quantity)) {
                console.log("quantity failed");
                return [];
            } else {
                console.log("quantity success");
                let divisibility = mosaicDefinitions[nem.utils.format.mosaicIdToName(copy[i].mosaicId)].mosaicDefinition.properties[0].value;
                // Get quantity from inputed amount
                copy[i].quantity = Math.round(nem.utils.helpers.cleanTextAmount(copy[i].quantity) * Math.pow(10, divisibility));
            }
        }
        return copy;
    }
    send(entity){
        console.log(entity);
        console.log(entity.mosaics);
        nem.model.transactions.send(this.common, entity, this.endpoint).then((res)=> {
            console.log(res);
        }, 
        (err)=> {
            console.error(err);
        });
    }
}
