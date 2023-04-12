export const copyText = (text: string) => {
    const dummy: any = document.createElement("textarea") || {} as any;
    document.body.appendChild(dummy);
    dummy.value = text;
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        dummy.contentEditable = true;
        dummy.readOnly = true;
        const range = document.createRange();
        range.selectNodeContents(dummy);
        const selection = window.getSelection() || {} as any;
        selection.removeAllRanges();
        selection.addRange(range);
        dummy.setSelectionRange(0, 999999);
    } else {
        dummy.select();
    }

    document.execCommand("copy");
    document.body.removeChild(dummy);
    navigator.clipboard.writeText(text);
}
