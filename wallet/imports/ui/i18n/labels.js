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
    let lang = Session.get("language");
    if (!Labels[lang]) lang = "en";

    return Labels[lang];
}