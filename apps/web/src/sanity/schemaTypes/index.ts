import type { SchemaTypeDefinition } from "sanity";
import { faqType } from "./faq";
import { faqCategoryType } from "./faqCategory";
import {
  pricingComparisonType,
  pricingFeatureGroupType,
  pricingFeatureType,
  pricingPlanType,
  pricingPlanValueType,
  pricingSectionType,
} from "./pricingComparison";
import { docCategoryType } from "./docCategory";
import { docPageType } from "./docPage";
import { templateType } from "./template";
import { templateCategoryType } from "./templateCategory";
import { templateStackType } from "./templateStack";
import { mailQuickstartType } from "./mailQuickstart";
import { languageType } from "./language";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    languageType,
    docCategoryType,
    docPageType,
    faqType,
    faqCategoryType,
    pricingPlanType,
    pricingPlanValueType,
    pricingFeatureType,
    pricingFeatureGroupType,
    pricingSectionType,
    pricingComparisonType,
    templateType,
    templateCategoryType,
    templateStackType,
    mailQuickstartType,
  ],
};
