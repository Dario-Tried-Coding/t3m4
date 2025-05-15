import { LinientAutoComplete } from "@t3m4/utils";

import { FACETS } from "../../../../constants/facets";

import { Selector } from "../../../../constants/selectors";

export type Base = Partial<{ name: LinientAutoComplete<FACETS['mode']>; selector: Selector | Selector[]; store: boolean }>