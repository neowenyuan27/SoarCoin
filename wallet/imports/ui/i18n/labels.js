import cnLables from "./cn-labels";
import enLables from "./en-labels";
import frLables from "./fr-labels";
import deLables from "./de-labels";

export const Labels = {
    en: enLables,
    cn: cnLables,
    fr: frLables,
    de: deLables
}

export default msgs = function () {
    return Labels[Session.get("language") || "en"];
}