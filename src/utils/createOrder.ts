import { Keypair } from '@solana/web3.js';

type createOrderParams = {
    owner: string,
    inAmount: number,
    outAmount: number,
    inputMint: string,
    outputMint: string,
}

export default async function createOrder(params: createOrderParams) {
    console.log(params, "params")
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
                base: Keypair.generate().publicKey.toString(),
            })
        })
    ).json();
    return transactions
}
