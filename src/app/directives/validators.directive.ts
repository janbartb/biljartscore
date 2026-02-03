import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/** confirm password */
export function confirmPassword(matchTocontrolName: string, reverse?: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.parent && reverse) {
            const c = (control.parent?.controls as any)[matchTocontrolName] as AbstractControl;
            if (c) {
                c.updateValueAndValidity();
            }
            return null;
        }
        if (!!control.parent && !!control.parent.value && control.value === (control.parent?.controls as any)[matchTocontrolName].value) {
            return null;
        }
        else {
            return { mismatch: true };
        }
    };
}

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

export function isModuloVijf(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return Number(control.value) && Number(control.value) % 5 == 0 ? null : {isModuloVijf: {valid: false}};
    };
}

export function isHeelGetal(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return (Number.isInteger(control.value)) ? null : {isHeelGetal: {valid: false}};
    };
}

export function isIntegerNotNegative(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return Number.isInteger(control.value) && control.value >= 0 ? null : {isIntegerNotNegative: {valid: false}};
    };
}

export function isIntegerPositive(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return Number.isInteger(control.value) && Number(control.value) > 0 ? null : {isIntegerPositive: {valid: false}};
    };
}

export function validDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        let isValid = true;
        if (control.value.trim().length != 10) {
            isValid = false;
        }
        else {
            const iso = control.value.trim() + 'T12:00:00.000Z';
            const d = new Date(iso);
            isValid = !Number.isNaN(d.valueOf()) && d.toISOString() === iso;
        }
        return !isValid ? {validDate: {valid: false}} : null;
    };
}

export function validDateNotFuture(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        let isValid = true;
        if (control.value.trim().length != 10) {
            isValid = false;
        }
        else {
            const iso = control.value.trim() + 'T12:00:00.000Z';
            const d = new Date(iso);
            isValid = !Number.isNaN(d.valueOf()) && d.toISOString() === iso;
            if (isValid) {
                const vandaag = new Date(Date.now()).toISOString().substring(0, 10);
                if (control.value.trim() > vandaag) {
                    isValid = false;
                }
            }
        }
        return !isValid ? {validDateNotFuture: {valid: false}} : null;
    };
}
