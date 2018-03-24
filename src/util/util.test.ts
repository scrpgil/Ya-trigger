import { Util } from './util';
import { Transaction } from '../transaction/transaction';
import nem from "nem-sdk";
import {MOCK, MOCK2, MOCK3, MOCK4  } from "../mock";

describe('util', () => {
    let util = new Util();
    describe('getSendAddress',() => {
        it('null failed"', () => {
            let res = {};
            expect(util.getSendAddress(res)).toBe('');
        })
        it('address invalid"', () => {
            expect(util.getSendAddress(MOCK.transaction)).toBe('');
            expect(util.getSendAddress(MOCK2.transaction)).toBe('');
        })
        it('success"', () => {
            expect(util.getSendAddress(MOCK4.transaction)).toBe('TAMH452PDTXYANJFDWXVPXFHSAEBN23Z7NKPWJEP');
        })
    });
    describe('getSendSignerAddress', () => {
        it('success"', () => {
            expect(util.getSendSignerAddress(MOCK.transaction)).toBe('TDYPKQ2ZVV6BPDLOZ4CMGTXD2MCAFC7DVEN7V4ZM');
        })
        it('success"', () => {
            expect(util.getSendSignerAddress(MOCK.transaction)).not.toBe('');
        })
    });
    describe('getAmount', () => {
        it('failed"', () => {
            expect(util.getAmount(MOCK.transaction)).not.toBe(util.getCalcAmount(10000000));
        })
        it('success"', () => {
            expect(util.getAmount(MOCK.transaction)).toBe(util.getCalcAmount(20000000));
        })
    });
    describe('fee test with prepareTransaction', () => {
        it('10xem fee"', () => {
            let t= util.prepareTransaction(10, "", "");
            expect(util.getCalcAmount(t.fee)).toBe(0.05);
        })
        it('10xem and Message fee"', () => {
            let t= util.prepareTransaction(10,  "","TAO5MJ7J35XXZFTW6V5BJOAHTORFS7WOE2VKJBFQ");
            expect(util.getCalcAmount(t.fee)).toBe(0.15);
        })
        it('20000xem fee"', () => {
            let t= util.prepareTransaction(20000,  "", "");
            expect(util.getCalcAmount(t.fee)).toBe(0.1);
        })
        it('100000xem fee"', () => {
            let t= util.prepareTransaction(100000, "TAO5MJ7J35XXZFTW6V5BJOAHTORFS7WOE2VKJBFQ", "");
            expect(util.getCalcAmount(t.fee)).toBe(0.5);
        })
        it('10 xem and mosaic fee"', async () => {
            await util.asyncSetup();
            let t = util.prepareTransaction(1, "TAO5MJ7J35XXZFTW6V5BJOAHTORFS7WOE2VKJBFQ", "" , 100);
            await expect(util.getCalcAmount(t.fee)).toBe(0.1);
        })
    });
    describe('get transaction', () => {
        it('success"', () => {
            expect(util.getHash(MOCK.meta)).toBe('cf177dc61fe8d0a0672f2f99affe737ab97f414a6f329438a2b51a30127ae8e5');
        })
        it('failed"', () => {
            expect(util.getHash(MOCK.meta)).not.toBe('f177dc61fe8d0a0672f2f99affe737ab97f414a6f329438a2b51a30127ae8e5');
        })
    });
    //describe('send transaction', () => {
    //    it('10xem fee"', async () => {
    //        await util.asyncSetup();
    //        let t = util.prepareTransaction(1, "TAMH452PDTXYANJFDWXVPXFHSAEBN23Z7NKPWJEP", "test" , 10);
    //        // NanoWalletで送金できているか確認する
    //        await expect(0.05).toBe(0.05);
    //    })
    //});
});
