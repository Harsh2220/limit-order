/**
 * Solana Actions Example
 */

import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse,
    createPostResponse,
} from "@solana/actions";
import {
    Authorized,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    StakeProgram,
    Transaction,
    clusterApiUrl
} from "@solana/web3.js";

export const DEFAULT_VALIDATOR_VOTE_PUBKEY: PublicKey = new PublicKey(
    "5ZWgXcyqrrNpQHCme5SdC5hCeYb2o3fEJhF7Gok3bTVN",
);

export const DEFAULT_STAKE_AMOUNT: number = 1.0;

export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const sellToken = requestUrl.searchParams.get("sellToken")
        const buyToken = requestUrl.searchParams.get("buyToken")
        const sellTokenAddress = requestUrl.searchParams.get("sellTokenAddress")
        const buyTokenAddress = requestUrl.searchParams.get("buyTokenAddress")

        console.log(sellToken, buyToken, sellTokenAddress, buyTokenAddress)

        const baseHref = new URL(
            `/api/actions/create?sellToken=${sellToken}&buyToken=${buyToken}&sellTokenAddress=${sellTokenAddress}&buyTokenAddress=${buyTokenAddress}`,
            requestUrl.origin,
        ).toString();

        const payload: ActionGetResponse = {
            title: `Sell ${sellToken} & Buy ${buyToken}`,
            icon: "https://cryptonary.com/cdn-cgi/image/width=2048/https://cryptonary.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/CryptoSchool0516_Limit-Orders_Jup.jpg",
            description: `Stake your SOL to the validator to secure the Solana network`,
            label: "Stake your SOL", // this value will be ignored since `links.actions` exists
            links: {
                actions: [
                    {
                        label: "Stake SOL", // button text
                        href: `${baseHref}&amount={amount}&rate={rate}`, // this href will have a text input
                        parameters: [
                            {
                                name: "amount", // parameter name in the `href` above
                                label: "Enter the amount", // placeholder of the text input
                                required: true,
                            },
                            {
                                name: "rate", // parameter name in the `href` above
                                label: "Enter the rate", // placeholder of the text input
                                required: true,
                            },
                        ],
                    },
                ],
            },
        };

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err) {
        console.log(err);
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(message, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);

        const body: ActionPostRequest = await req.json();

        // validate the client provided input
        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "account" provided', {
                status: 400,
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        const connection = new Connection(
            process.env.SOLANA_RPC! || clusterApiUrl("devnet"),
        );

        const minStake = await connection.getStakeMinimumDelegation();

        const stakeKeypair = Keypair.generate();

        const transaction = new Transaction().add(
            StakeProgram.createAccount({
                stakePubkey: stakeKeypair.publicKey,
                authorized: new Authorized(account, account),
                fromPubkey: account,
                lamports: 1 * LAMPORTS_PER_SOL,
                // note: if you want to time lock the stake account for any time period, this is how
                // lockup: new Lockup(0, 0, account),
            }),
            StakeProgram.delegate({
                stakePubkey: stakeKeypair.publicKey,
                authorizedPubkey: account,
                votePubkey: new PublicKey(""),
            }),
        );

        // set the end user as the fee payer
        transaction.feePayer = account;

        transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
        ).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: `Stake SOL to validator`,
            },
            // note: creating a new stake account requires the account's keypair to sign
            signers: [stakeKeypair],
        });

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err) {
        console.log(err);
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(message, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};