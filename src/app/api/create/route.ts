import createOrder from "@/utils/createOrder";
import getTokenInfo from "@/utils/getTokenInfo";
import getTokenPrice from "@/utils/getTokenPrice";
import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse
} from "@solana/actions";
import {
    PublicKey
} from "@solana/web3.js";

export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const sellTokenAddress = requestUrl.searchParams.get("sell")
        const buyTokenAddress = requestUrl.searchParams.get("buy")

        console.log(sellTokenAddress, buyTokenAddress)

        if (!sellTokenAddress || !buyTokenAddress) {
            return Response.json("Data not provided", {
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        const [sellTokenInfo, buyTokenInfo] = await Promise.all([getTokenInfo(sellTokenAddress), getTokenInfo(buyTokenAddress)])

        const payload: ActionGetResponse = {
            title: `Sell ${sellTokenInfo.result.symbol} & Buy ${buyTokenInfo.result.symbol}`,
            icon: "https://cryptonary.com/cdn-cgi/image/width=1920/https://cryptonary.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/HOW-TO-PLACE-LIMIT-ORDERS-ON-JUPITER.jpg",
            description: `Enter details and place limit orders within seconds.`,
            label: "Place Limit Order",
            links: {
                actions: [
                    {
                        label: "Place Limit Order",
                        href: `${requestUrl.href}&amount={amount}&rate={rate}`,
                        parameters: [
                            {
                                name: "amount",
                                label: "Enter the amount",
                                required: true,
                            },
                            {
                                name: "rate",
                                label: "Enter the rate",
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

        const sellTokenAddress = requestUrl.searchParams.get("sell")
        const buyTokenAddress = requestUrl.searchParams.get("buy")
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

        const inAmount = parseInt(amount) * Math.pow(10, parseInt(sellTokenInfo.result.decimals))
        const ss = buyTokenPrice / Number(rate);
        const outAmount = (inAmount * ss) / buyTokenPrice;

        const data = await createOrder({
            inAmount: inAmount,
            outAmount: outAmount,
            inputMint: sellTokenAddress,
            outputMint: buyTokenAddress,
            owner: account.toString(),
        })

        console.log(data)

        const payload: ActionPostResponse = {
            transaction: data?.tx,
            message: `Limit order created`,
        };

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err) {
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(message, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};