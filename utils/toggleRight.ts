import { ZERO_ADDRESS } from "./constants";

export enum MANAGING {
    RESERVEDEPOSITOR = 0,
    RESERVESPENDER,
    RESERVETOKEN,
    RESERVEMANAGER,
    LIQUIDITYDEPOSITOR,
    LIQUIDITYTOKEN,
    LIQUIDITYMANAGER,
    DEBTOR,
    REWARDMANAGER,
    SOHM,
}

export default async function toggleRights(
    treasury: any,
    managing: MANAGING,
    address: string,
    calculator = ZERO_ADDRESS
) {
    await treasury.queue(managing, address);
    await treasury.toggle(managing, address, calculator);
}
