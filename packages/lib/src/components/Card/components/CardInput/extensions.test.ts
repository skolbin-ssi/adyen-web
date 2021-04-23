import extensions from './extensions';

let CIExtensions;

// Mock sfp useRef
let sfp = {
    current: {
        processBinLookupResponse: () => {}
    }
};

let issuingCountryCode = null;
let setIssuingCountryCode;

let additionalSelectElements = [];
let setAdditionalSelectElements;

let additionalSelectValue = '';
let setAdditionalSelectValue;

beforeEach(() => {
    setIssuingCountryCode = jest.fn(countryCode => {
        issuingCountryCode = countryCode;
    });

    setAdditionalSelectElements = jest.fn(selectElements => {
        additionalSelectElements = selectElements;
    });

    setAdditionalSelectValue = jest.fn(selectVal => {
        additionalSelectValue = selectVal;
    });

    CIExtensions = extensions({}, { sfp }, { setAdditionalSelectValue, setAdditionalSelectElements, setIssuingCountryCode });
});

describe('Testing CardInput extensions (handling binLookup response related functionality)', () => {
    test('issuingCountryCode state var is converted to lowerCase', () => {
        CIExtensions.processBinLookup({ issuingCountryCode: 'KR' }, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('kr');
    });
});

describe('Test mock binLookup results on CardInput.state', () => {
    const dualBrandObj1 = {
        brand: 'visa',
        cvcPolicy: 'required',
        enableLuhnCheck: 'true',
        showExpiryDate: 'true',
        supported: 'true'
    };

    const dualBrandObj2 = {
        brand: 'cartebancaire',
        cvcPolicy: 'required',
        enableLuhnCheck: 'true',
        showExpiryDate: 'true',
        supported: 'true'
    };

    const mockBinLookupObj_dual = {
        issuingCountryCode: 'FR',
        supportedBrands: [dualBrandObj1, dualBrandObj2]
    };

    const mockBinLookupObj_single = {
        issuingCountryCode: 'US',
        supportedBrands: [
            {
                brand: 'mc',
                cvcPolicy: 'required',
                enableLuhnCheck: 'true',
                showExpiryDate: 'true',
                supported: 'true'
            }
        ]
    };

    test('CardInput.state contains expected values from a "dual-branded" lookup result', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_dual, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('fr');

        expect(additionalSelectElements).toEqual([
            { id: 'visa', brandObject: dualBrandObj1 },
            { id: 'cartebancaire', brandObject: dualBrandObj2 }
        ]);

        expect(additionalSelectValue).toEqual('');
    });

    test('CardInput.state is altered when a "dual-branded" lookup result is followed by a "single" lookup result ', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_dual, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('fr');

        CIExtensions.processBinLookup(mockBinLookupObj_single, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(2);
        expect(issuingCountryCode).toEqual('us');

        expect(additionalSelectElements).toEqual([]);
        expect(additionalSelectValue).toEqual('mc');
    });

    test('CardInput.state is altered when a "dual-branded" lookup result is followed by a "reset" result ', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_dual, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('fr');

        CIExtensions.processBinLookup(null, true);

        expect(issuingCountryCode).toEqual(null);

        expect(additionalSelectElements).toEqual([]);
        expect(additionalSelectValue).toEqual('');
    });

    test('CardInput.state is altered when a "single" lookup result is followed by a "reset" result ', () => {
        CIExtensions.processBinLookup(mockBinLookupObj_single, false);

        expect(setIssuingCountryCode).toHaveBeenCalledTimes(1);
        expect(issuingCountryCode).toEqual('us');

        expect(additionalSelectElements).toEqual([]);
        expect(additionalSelectValue).toEqual('mc');

        CIExtensions.processBinLookup(null, true);

        expect(issuingCountryCode).toEqual(null);

        expect(additionalSelectElements).toEqual([]);
        expect(additionalSelectValue).toEqual('');
    });
});
