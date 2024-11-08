import { test as base, mergeTests, expect } from '@playwright/test';
import { DropinWithSession } from '../../../../../models/dropinWithSession';
import { test as card } from '../../../../../fixtures/card.fixture';

class DropinWithCard extends DropinWithSession {
    get card() {
        return super.getPaymentMethodLabelByType('scheme');
    }

    get visibleCardBrands() {
        return this.card.locator('.adyen-checkout__payment-method__brands').getByRole('img').all();
    }

    get remainingCardBrandsNumber() {
        return this.card.locator('.adyen-checkout__payment-method__brand-number');
    }
}

type Fixture = {
    dropinWithCard: DropinWithCard;
};

const dropin = base.extend<Fixture>({
    dropinWithCard: async ({ page }, use) => {
        const dropin = new DropinWithCard(page);
        await use(dropin);
    }
});

const test = mergeTests(card, dropin);

export { test, expect };
