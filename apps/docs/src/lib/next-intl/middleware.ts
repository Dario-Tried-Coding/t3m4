import createMiddleware from "next-intl/middleware";
import { i18nRouting } from "./routing";

export const i18nMiddleware = createMiddleware(i18nRouting)