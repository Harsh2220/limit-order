import { Keypair, PublicKey } from '@solana/web3.js';

type createOrderParams = {
    owner: PublicKey,
    inAmount: number,
    outAmount: number,
    inputMint: string,
    outputMint: string,
}

export default async function createOrder(params: createOrderParams) {
    const transactions = await (
        await fetch('https://jup.ag/api/limit/v1/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                owner: params.owner,
                inAmount: params.inAmount,
                outAmount: params.outAmount,
                inputMint: params.inputMint,
                outputMint: params.outputMint,
                expiredAt: null,
                base: Keypair.generate(),
            })
        })
    ).json();
    return transactions
}
