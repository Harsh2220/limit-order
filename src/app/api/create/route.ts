import createOrder from "@/utils/createOrder";
import getTokenInfo from "@/utils/getTokenInfo";
import getTokenPrice from "@/utils/getTokenPrice";
import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
    ActionPostRequest
} from "@solana/actions";
import {
    PublicKey
} from "@solana/web3.js";

export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const sellTokenAddress = requestUrl.searchParams.get("sellTokenAddress")
        const buyTokenAddress = requestUrl.searchParams.get("buyTokenAddress")

        console.log(sellTokenAddress, buyTokenAddress)

        if (!sellTokenAddress || !buyTokenAddress) {
            return Response.json("Data not provided", {
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        const [sellTokenInfo, buyTokenInfo] = await Promise.all([getTokenInfo(sellTokenAddress), getTokenInfo(buyTokenAddress)])

        const payload: ActionGetResponse = {
            title: `Sell ${sellTokenInfo.result.symbol} & Buy ${buyTokenInfo.result.symbol}`,
            icon: "https://cryptonary.com/cdn-cgi/image/width=2048/https://cryptonary.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/CryptoSchool0516_Limit-Orders_Jup.jpg",
            description: `Stake your SOL to the validator to secure the Solana network`,
            label: "Stake your SOL", // this value will be ignored since `links.actions` exists
            links: {
                actions: [
                    {
                        label: "Create Limit Order", // button text
                        href: `${requestUrl.href}&amount={amount}&rate={rate}`, // this href will have a text input
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

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);

        const body: ActionPostRequest = await req.json();

        const sellTokenAddress = requestUrl.searchParams.get("sellTokenAddress")
        const buyTokenAddress = requestUrl.searchParams.get("buyTokenAddress")
        const amount = requestUrl.searchParams.get("amount")
        const rate = requestUrl.searchParams.get("rate")

        let account: PublicKey;

        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "account" provided', {
                status: 400,
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        if (!sellTokenAddress || !buyTokenAddress || !amount || !rate) {
            return Response.json("Data not provided", {
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        const [buyTokenPrice, sellTokenInfo] = await Promise.all([getTokenPrice(buyTokenAddress), getTokenInfo(sellTokenAddress)])

        const inAmount = Math.pow(10, parseInt(sellTokenInfo.result.decimals))
        const ss = buyTokenPrice / Number(rate);
        const outAmount = (Number(parseInt(amount) * inAmount) * Number(ss)) / buyTokenPrice;

        const transaction = await createOrder({
            inAmount: inAmount,
            outAmount: outAmount,
            inputMint: sellTokenAddress,
            outputMint: buyTokenAddress,
            owner: account,
        })

        return Response.json(transaction, {
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