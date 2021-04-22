import { Selector } from 'testcafe';
import { start, getIframeSelector } from '../../utils/commonUtils';
import cu from '../../cards/utils/cardUtils';
import { CUSTOMCARDS_URL } from '../../pages';
import LANG from '../../../../lib/src/language/locales/en-US.json';

const errorHolder = Selector('.pm-form-label__error-text');

const CARD_TOO_OLD = LANG['error.va.sf-cc-dat.01'];
const CARD_TOO_FAR = LANG['error.va.sf-cc-dat.02'];
const CARD_EXPIRES_BEFORE = LANG['error.va.sf-cc-dat.03'];

const TEST_SPEED = 1;

// Applies to regular, single date field custom card
const iframeSelectorRegular = getIframeSelector('.secured-fields iframe');
const cardUtilsRegular = cu(iframeSelectorRegular);

fixture`Testing setting minimumExpiryDate (on regular Custom card component) - that it is recognised but doesn't override the other checks on date for a card being too old or too far in the future`
    .page(CUSTOMCARDS_URL)
    .clientScripts('expiryDate.clientScripts.js');

test('With minimumExpiryDate set - input an expiry date that is too old & expect the correct error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await cardUtilsRegular.fillDate(t, '12/20');

    // Expect visible error: "Card too old"
    await t
        .expect(errorHolder.filterVisible().exists)
        .ok()
        .expect(errorHolder.withExactText(CARD_TOO_OLD).exists)
        .ok();
});

test('With minimumExpiryDate set - input an expiry date that is 1 month before it & expect the correct error', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await cardUtilsRegular.fillDate(t, '08/22');

    // Expect visible error: "Card expires before..."
    await t
        .expect(errorHolder.filterVisible().exists)
        .ok()
        .expect(errorHolder.withExactText(CARD_EXPIRES_BEFORE).exists)
        .ok();
});

test('With minimumExpiryDate set - input an expiry date that is matches it & expect no error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card in date
    await cardUtilsRegular.fillDate(t, '09/22');

    // Expect NO errors
    await t.expect(errorHolder.filterHidden().exists).ok();
});

test('With minimumExpiryDate set - input an expiry date that exceeds it (a bit) & expect no error', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card in date
    await cardUtilsRegular.fillDate(t, '04/23');

    // Expect NO errors
    await t.expect(errorHolder.filterHidden().exists).ok();
});

test('With minimumExpiryDate set - input an expiry date that is too far in the future, & expect the correct error ', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Card out of date
    await cardUtilsRegular.fillDate(t, '12/90');

    // Expect visible error: "Card too far in the future"
    await t
        .expect(errorHolder.filterVisible().exists)
        .ok()
        .expect(errorHolder.withExactText(CARD_TOO_FAR).exists)
        .ok();
});

test(
    'General "date edit" bug: with minimumExpiryDate set - input an expiry date that is matches it & expect no error ' +
        'then edit the date to be before the minimumExpiryDate and expect that to register as an error',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Card in date
        await cardUtilsRegular.fillDate(t, '09/22');

        // Expect NO errors
        await t.expect(errorHolder.filterHidden().exists).ok();

        // Card out of date
        await cardUtilsRegular.fillDate(t, '08/22', 'paste');

        // Expect visible error: "Card expires before..."
        await t
            .expect(errorHolder.filterVisible().exists)
            .ok()
            .expect(errorHolder.withExactText(CARD_EXPIRES_BEFORE).exists)
            .ok();
    }
);

test(
    'General "date edit" bug: input a valid expiry date & expect no error ' +
        'then edit the date to be before invalid and expect that to immediately register as an error',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Card in date
        await cardUtilsRegular.fillDate(t, '04/30');

        // Expect NO errors
        await t.expect(errorHolder.filterHidden().exists).ok();

        // Card out of date
        await cardUtilsRegular.fillDate(t, '04/10', 'paste');

        // Expect visible error: "Card too old"
        await t
            .expect(errorHolder.filterVisible().exists)
            .ok()
            .expect(errorHolder.withExactText(CARD_TOO_OLD).exists)
            .ok();
    }
);
