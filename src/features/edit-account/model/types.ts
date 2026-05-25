export interface EditAccountFormValues {
  firstName: string;
  lastName: string;
  /** BCP 47 locale tag (e.g. "en-US"). Null means "leave unchanged". */
  locale: string | null;
}
