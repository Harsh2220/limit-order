export default function getShortName(token: string) {
    const words = token.toUpperCase().split(" ");

    if (words.length === 1) {
        return words[0][0] + words[0][1];
    } else {
        return words[0][0] + words[1][0];
    }
}
