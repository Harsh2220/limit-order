import { JupTokens } from "@/types/jup";
import { create } from "zustand";

interface ITokenStore {
    tokens: null | JupTokens[];
    sellToken: null | JupTokens;
    buyToken: null | JupTokens;
    setTokens: (tokens: JupTokens[]) => void;
    setSellToken: (sellToken: JupTokens) => void;
    setBuyToken: (buyToken: JupTokens) => void;
}

const useTokenStore = create<ITokenStore>((set) => ({
    tokens: null,
    sellToken: null,
    buyToken: null,
    setTokens: (tokens) =>
        set({
            tokens: tokens,
        }),
    setSellToken: (sellToken) =>
        set({
            sellToken: sellToken,
        }),
    setBuyToken: (buyToken) =>
        set({
            buyToken: buyToken,
        }),
}));

export default useTokenStore;