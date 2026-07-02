<?php

namespace App\Enums;

enum PracticeSetBusinessType: string
{
    case ServiceBusiness = 'service_business';
    case MerchandisingBusiness = 'merchandising_business';
    case ManufacturingBusiness = 'manufacturing_business';
    case Restaurant = 'restaurant';
    case LaundryShop = 'laundry_shop';
    case CoffeeShop = 'coffee_shop';
    case RetailStore = 'retail_store';
    case Custom = 'custom';

    public function label(): string
    {
        return match ($this) {
            self::ServiceBusiness => 'Service Business',
            self::MerchandisingBusiness => 'Merchandising Business',
            self::ManufacturingBusiness => 'Manufacturing Business',
            self::Restaurant => 'Restaurant',
            self::LaundryShop => 'Laundry Shop',
            self::CoffeeShop => 'Coffee Shop',
            self::RetailStore => 'Retail Store',
            self::Custom => 'Custom',
        };
    }
}
