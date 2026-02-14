import {
    BsCart3, BsBusFront, BsLightningCharge, BsBag, BsFilm, BsHeart, BsBook,
    BsCashCoin, BsGraphUpArrow, BsGift, BsBox, BsArrowLeftRight,
    BsHouseDoor, BsAirplane, BsController, BsCup, BsWrench, BsCapsule,
    BsMusicNote, BsBrush, BsCreditCard2Front, BsPhone, BsDroplet, BsShield,
    BsStar, BsTag, BsTrophy, BsPiggyBank, BsBank, BsReceipt, BsCash
} from 'react-icons/bs';

/* ─── Icon name → React component mapping ─── */
const ICON_MAP = {
    BsCart3, BsBusFront, BsLightningCharge, BsBag, BsFilm, BsHeart, BsBook,
    BsCashCoin, BsGraphUpArrow, BsGift, BsBox, BsArrowLeftRight,
    BsHouseDoor, BsAirplane, BsController, BsCup, BsWrench, BsCapsule,
    BsMusicNote, BsBrush, BsCreditCard2Front, BsPhone, BsDroplet, BsShield,
    BsStar, BsTag, BsTrophy, BsPiggyBank, BsBank, BsReceipt, BsCash
};

/* ─── Category → default icon mapping (fallback when no icon string) ─── */
const CATEGORY_ICON_MAP = {
    Food: BsCart3,
    Transport: BsBusFront,
    Bills: BsLightningCharge,
    Shopping: BsBag,
    Entertainment: BsFilm,
    Health: BsHeart,
    Education: BsBook,
    Salary: BsCashCoin,
    Investment: BsGraphUpArrow,
    Gift: BsGift,
    Transfer: BsArrowLeftRight,
    Other: BsBox,
};

/**
 * Resolves an icon name string (e.g. "BsCart3") to a React Icon component.
 * Falls back to BsBox if not found.
 */
export const getIconComponent = (iconName) => {
    return ICON_MAP[iconName] || BsBox;
};

/**
 * Gets the default icon component for a category name.
 */
export const getCategoryIcon = (category) => {
    return CATEGORY_ICON_MAP[category] || BsBox;
};

/**
 * All available icon options for the category icon picker.
 * Each entry has { key, component, label }
 */
export const ICON_OPTIONS = [
    { key: 'BsCart3', component: BsCart3, label: 'Cart' },
    { key: 'BsBusFront', component: BsBusFront, label: 'Transport' },
    { key: 'BsLightningCharge', component: BsLightningCharge, label: 'Lightning' },
    { key: 'BsBag', component: BsBag, label: 'Bag' },
    { key: 'BsFilm', component: BsFilm, label: 'Film' },
    { key: 'BsHeart', component: BsHeart, label: 'Heart' },
    { key: 'BsBook', component: BsBook, label: 'Book' },
    { key: 'BsCashCoin', component: BsCashCoin, label: 'Cash' },
    { key: 'BsGraphUpArrow', component: BsGraphUpArrow, label: 'Graph' },
    { key: 'BsGift', component: BsGift, label: 'Gift' },
    { key: 'BsBox', component: BsBox, label: 'Box' },
    { key: 'BsHouseDoor', component: BsHouseDoor, label: 'Home' },
    { key: 'BsAirplane', component: BsAirplane, label: 'Travel' },
    { key: 'BsController', component: BsController, label: 'Games' },
    { key: 'BsCup', component: BsCup, label: 'Drinks' },
    { key: 'BsWrench', component: BsWrench, label: 'Tools' },
    { key: 'BsCapsule', component: BsCapsule, label: 'Medicine' },
    { key: 'BsMusicNote', component: BsMusicNote, label: 'Music' },
    { key: 'BsBrush', component: BsBrush, label: 'Art' },
    { key: 'BsPhone', component: BsPhone, label: 'Phone' },
    { key: 'BsReceipt', component: BsReceipt, label: 'Receipt' },
    { key: 'BsPiggyBank', component: BsPiggyBank, label: 'Savings' },
    { key: 'BsBank', component: BsBank, label: 'Bank' },
    { key: 'BsCash', component: BsCash, label: 'Money' },
];

export default ICON_MAP;
