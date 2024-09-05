import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/** No duplicates allowed */
export function noDuplicates(existing: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const duplicate = existing.findIndex(x => x == control.value) >= 0;
        return duplicate ? {noDuplicates: {valid: false}} : null;
    };
}