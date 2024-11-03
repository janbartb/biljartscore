import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/** No duplicates allowed */
export function noDuplicates(existing: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const duplicate = existing.findIndex(x => x == control.value.trim()) >= 0;
        return duplicate ? {noDuplicates: {valid: false}} : null;
    };
}

export function notEmpty(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return !control.value.trim().length ? {notEmpty: {valid: false}} : null;
    };
}

export function greaterZero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return Number(control.value) && Number(control.value) > 0 ? null : {greaterZero: {valid: false}};
    };
}