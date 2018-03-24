import { Trigger } from './trigger';
import { Util } from '../util/util';
import nem from "nem-sdk";
import {tMock} from "../mock";
import {YA_ADDRESS} from "../config";

describe('util', () => {
    let trigger = new Trigger();
    let util = new Util();
    describe('valid check',() => {
        let send_address = util.getSendAddress(tMock.transaction);
        let signer_address = util.getSendSignerAddress(tMock.transaction);
        let hash = util.getHash(tMock.meta);
        let amount = util.getAmount(tMock.transaction);
        describe('validSendAddress',() => {
            it('success"', () => {
                console.log(send_address);
                expect(trigger.validSendAddress(send_address)).toBe(true);
            })
            it('null"', () => {
                expect(trigger.validSendAddress("")).toBe(false);
            })
            it('ya_address"', () => {
                expect(trigger.validSendAddress(YA_ADDRESS)).toBe(false);
            })
        });
        describe('validSignerAddress',() => {
            it('success"', () => {
                expect(trigger.validSignerAddress(signer_address)).toBe(true);
            })
            it('null"', () => {
                expect(trigger.validSignerAddress("")).toBe(false);
            })
            it('ya_address"', () => {
                expect(trigger.validSignerAddress(YA_ADDRESS)).toBe(false);
            })
        });
        describe('validAmount',() => {
            it('higher"', () => {
                expect(trigger.validAmount(amount)).toBe(true);
            })
            it('lower"', () => {
                expect(trigger.validAmount(0.9)).toBe(false);
            })
        });
        describe('calcRepaymentAmount',() => {
            it('calc"', () => {
                expect(trigger.calcRepaymentAmount(3)).toBe(1.5);
            })
        });
    });
});
