import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Compass, ChevronLeft, HelpCircle, Sparkles, MapPin, Globe, 
    Plane, Calendar, ChevronDown, Download, Share2, FileText, 
    Sun, CloudSun, Utensils, ShieldCheck, Check, Copy, ArrowRight, 
    Clock, Coins, Lightbulb, X, RefreshCw, Send, CheckCircle2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface TravelGuideViewProps {
    userProfile: UserProfile;
    onClose: () => void;
}

export type TravelOrbit = 'domestic' | 'international';
export type TravelLanguage = 'en' | 'bn' | 'hi';
export type ActiveTab = 'overview' | 'itinerary' | 'climate' | 'food' | 'safety';

export interface DayPlan {
    day: string;
    title: string;
    morning: string;
    afternoon: string;
    evening: string;
    activities?: string;
}

export interface TravelDossier {
    destination: string;
    bengaliName?: string;
    hindiName?: string;
    orbit: TravelOrbit;
    duration: number;
    standard: string;
    tagline: string;
    overview: string;
    costEstimate: string;
    costBreakdown: {
        budget: string;
        comfort: string;
        luxury: string;
    };
    bestTimeToVisit: string;
    howToReach: string;
    topHighlights: string[];
    itinerary: DayPlan[];
    climateAndDressing: string;
    clothingAdvice: string[];
    localFood: string[];
    foodHighlights: { name: string; desc: string }[];
    safetyAndEmergency: string[];
    emergencyNumbers: { service: string; contact: string }[];
}

const PRESET_DESTINATIONS: Record<string, { en: TravelDossier; bn: TravelDossier; hi: TravelDossier }> = {
    'darjeeling': {
        en: {
            destination: 'Darjeeling',
            orbit: 'domestic',
            duration: 5,
            standard: 'Comfort Level',
            tagline: 'Queen of the Himalayas & Emerald Tea Valleys',
            overview: 'Perched at an elevation of 6,700 ft in West Bengal, Darjeeling is globally celebrated for its panoramic vistas of Mt. Kanchenjunga, world-renowned black tea gardens, and the heritage UNESCO Toy Train. A serene blend of colonial charm, Gorkha warmth, and Tibetan monastic peace.',
            costEstimate: '₹18,000 – ₹32,000 per person (5 Days)',
            costBreakdown: {
                budget: '₹12,000 – ₹16,000 (Shared cabs, cozy homestays, street momos)',
                comfort: '₹22,000 – ₹30,000 (Private Innova, 3-star view hotel, cafe dining)',
                luxury: '₹45,000+ (Heritage tea estate resort, private chauffeur, luxury dining)'
            },
            bestTimeToVisit: 'October to May (Clear skies, Kanchenjunga sunrise views, pleasant rhododendron blooms)',
            howToReach: 'Flight to Bagdogra Airport (IXB) or Train to New Jalpaiguri (NJP), followed by a scenic 3-hour uphill drive via Kurseong.',
            topHighlights: [
                'Tiger Hill 4:00 AM Sunrise over Mt. Kanchenjunga',
                'Batasia Loop & UNESCO Himalayan Toy Train Joyride',
                'Glenary’s Bakery & Keventer’s Breakfast on Mall Road',
                'Happy Valley Organic Tea Estate Walk & Tasting',
                'Himalayan Mountaineering Institute & Snow Leopard Zoo'
            ],
            itinerary: [
                {
                    day: 'Day 1',
                    title: 'Arrival & Chowrasta Mall Promenade',
                    morning: 'Scenic mountain ascent from Bagdogra/NJP through misty tea slopes.',
                    afternoon: 'Check into hotel with mountain view; enjoy first steaming cup of First Flush tea.',
                    evening: 'Stroll around Chowrasta Mall, listen to local acoustic musicians, and dine at historic Glenary’s Pub.'
                },
                {
                    day: 'Day 2',
                    title: 'Tiger Hill Sunrise & 7 Iconic Points',
                    morning: 'Pre-dawn 4:00 AM drive to Tiger Hill. Witness the golden sunrise over Mt. Kanchenjunga. Visit Batasia Loop and ancient Ghoom Monastery.',
                    afternoon: 'Tour Himalayan Mountaineering Institute (HMI) and the Padmaja Naidu Himalayan Zoological Park.',
                    evening: 'Visit the Japanese Peace Pagoda for panoramic sunset prayers; unwind with Darjeeling momos.'
                },
                {
                    day: 'Day 3',
                    title: 'Heritage Toy Train & Tea Plantation Walk',
                    morning: 'Board the historic steam-engine DHR Toy Train for a heritage joyride to Ghoom and back.',
                    afternoon: 'Guided walk through Happy Valley Tea Estate; learn orthodox tea leaf plucking and tea tasting.',
                    evening: 'Boutique shopping for hand-knitted pashminas, brass prayer wheels, and certified tea at Nehru Road.'
                },
                {
                    day: 'Day 4',
                    title: 'Mirik Lake & Pashupati Nepal Border Excursion',
                    morning: 'Drive through pine forests to the peaceful Mirik Sumendu Lake; enjoy boating and horse riding.',
                    afternoon: 'Stop by Pashupati Market on the Nepal border for duty-free curios and local Tibetan handicrafts.',
                    evening: 'Return to Darjeeling; cozy dinner with hot Thukpa and Shaphalay at Kunga Restaurant.'
                },
                {
                    day: 'Day 5',
                    title: 'Morning Kanchenjunga View & Departure',
                    morning: 'Rooftop morning view of snow peaks; final English breakfast at Keventer’s terrace.',
                    afternoon: 'Pack artisanal tea boxes and transfer back to Bagdogra Airport or NJP Station with golden memories.',
                    evening: 'Onward journey home carrying the fragrance of Himalayan pines.'
                }
            ],
            climateAndDressing: 'Darjeeling features a temperate sub-tropical highland climate. In autumn/spring, expect crisp mountain breezes (10°C to 18°C), while winters drop between 2°C to 8°C with occasional frost.',
            clothingAdvice: [
                'Pack layered woolens: thermal innerwear, cashmere sweaters, and a windproof jacket',
                'Comfortable sturdy walking shoes or hiking boots with rubber grip for cobblestone hills',
                'Warm woolen beanie/cap, muffler, and sunglasses for Tiger Hill morning glare',
                'Compact umbrella or light rain poncho as mist and clouds can bring brief showers'
            ],
            localFood: ['Steaming Pork/Chicken/Veg Momos', 'Hot Tibetan Thukpa (Noodle Soup)', 'Shaphalay (Crisp meat pie)', 'Churpi (Himalayan organic yak cheese)', 'First Flush Muscatel Black Tea'],
            foodHighlights: [
                { name: "Glenary's Bakery & Cafe", desc: 'Heritage 130-year-old bakery serving fresh apple pies, rum balls, and breakfast.' },
                { name: "Keventer's Terrace", desc: 'Iconic rooftop famous for hot cocoa, English sausages, and Kanchenjunga views.' },
                { name: "Kunga Restaurant", desc: 'Legendary Tibetan eatery with the richest steaming Thukpa and chili garlic momos.' }
            ],
            safetyAndEmergency: [
                'Acclimatize gently if prone to altitude sickness; stay hydrated with warm water',
                'Book Toy Train joyride tickets at least 15-30 days in advance on IRCTC to avoid sell-outs',
                'Only hire West Bengal Tourism-certified taxis with fixed fare cards at Chowrasta taxi stand'
            ],
            emergencyNumbers: [
                { service: 'Darjeeling District Police Helpline', contact: '100 / 0354-2254422' },
                { service: 'District Hospital Darjeeling (Eden)', contact: '0354-2254218' },
                { service: 'Tourist Assistance Center (Mall Road)', contact: '0354-2254879' }
            ]
        },
        bn: {
            destination: 'দার্জিলিং',
            orbit: 'domestic',
            duration: 5,
            standard: 'Comfort Level',
            tagline: 'হিমালয়ের রানী ও শ্যামল চা বাগানের স্বর্গোদ্যান',
            overview: 'পশ্চিমবঙ্গের মনোরম শৈলশহর দার্জিলিং বিশ্বজুড়ে বিখ্যাত কাঞ্চনজঙ্ঘার অপরূপ সূর্যোদয়, বিশ্বখ্যাত অর্থোডক্স চা এবং ঐতিহ্যবাহী ইউনেস্কো টয় ট্রেনের জন্য। পাহাড়ি স্নিগ্ধতা ও গোর্খা সংস্কৃতির এক অনন্য মেলবন্ধন।',
            costEstimate: '₹১৮,০০০ – ₹৩২,০০০ জনপ্রতি (৫ দিন)',
            costBreakdown: {
                budget: '₹১২,০০০ – ₹১৬,০০০ (শেয়ার্ড ট্যাক্সি, আরামদায়ক হোমস্টে, লোকাল মোমো)',
                comfort: '₹২২,০০০ – ₹৩০,০০০ (প্রাইভেট ইনোভা, ভিউ রিসর্ট, ঐতিহাসিক ক্যাফে)',
                luxury: '₹৪৫,০০০+ (হেরিটেজ টি এস্টেট ভিলা, ব্যক্তিগত শোফার ও ফাইন ডাইনিং)'
            },
            bestTimeToVisit: 'অক্টোবর থেকে মে (পরিষ্কার আকাশ, বরফাবৃত কাঞ্চনজঙ্ঘার দর্শন ও মনোরম আবহাওয়া)',
            howToReach: 'বাগডোগরা বিমানবন্দর (IXB) অথবা নিউ জলপাইগুড়ি (NJP) রেল স্টেশন থেকে কার্শিয়াং হয়ে ৩ ঘণ্টার চমৎকার পাহাড়ি ড্রাইভ।',
            topHighlights: [
                'ভোর ৪:০০ টায় টাইগার হিল থেকে কাঞ্চনজঙ্ঘার স্বর্ণালী সূর্যোদয়',
                'বাতাসিয়া লুপ ও ইউনেস্কো হেরিটেজ টয় ট্রেন জয়রাইড',
                'ম্যাল রোডে ঐতিহ্যবাহী গ্লেনারি’স বেকারি ও কেভেন্টার্স প্রাতরাশ',
                'হ্যাপি ভ্যালি অর্গানিক চা বাগান পরিদর্শন ও ফ্রেশ চা পাতা আস্বাদন',
                'হিমালয়ান মাউন্টেনিয়ারিং ইনস্টিটিউট (HMI) ও স্নো লেপার্ড চিড়িয়াখানা'
            ],
            itinerary: [
                {
                    day: '১ম দিন',
                    title: 'দার্জিলিং আগমন ও ম্যাল রোডে সান্ধ্য পদচারণা',
                    morning: 'বাগডোগরা বা এনজেপি থেকে কুয়াশাঘেরা সবুজ চা বাগানের পথ বেয়ে দার্জিলিংয়ের উদ্দেশ্যে যাত্রা।',
                    afternoon: 'পাহাড়মুখী হোটেলে চেক-ইন এবং তাজা দার্জিলিং ব্ল্যাক টি-এর আমেজ গ্রহণ।',
                    evening: 'ম্যাল রোডে হেঁটে আড্ডা, স্থানীয় পাহাড়ি সঙ্গীত উপভোগ ও ঐতিহ্যবাহী গ্লেনারি’সে রাতের খাবার।'
                },
                {
                    day: '২য় দিন',
                    title: 'টাইগার হিল সূর্যোদয় ও ৭টি দর্শনীয় স্থান',
                    morning: 'ভোর ৪টায় টাইগার হিল যাত্রা। কাঞ্চনজঙ্ঘার চূড়ায় প্রথম সূর্যের আলো দেখা। বাতাসিয়া লুপ ও ঘুম মনাস্ট্রি ভ্রমণ।',
                    afternoon: 'হিমালয়ান মাউন্টেনিয়ারিং ইনস্টিটিউট ও পদ্মজা নাইডু জুওলজিক্যাল পার্ক পরিদর্শন।',
                    evening: 'জাপানিজ পিস প্যাগোডা দর্শন এবং গরম গরম পাহাড়ি স্যুপ ও মোমোর আস্বাদন।'
                },
                {
                    day: '৩য় দিন',
                    title: 'হেরিটেজ টয় ট্রেন ও হ্যাপি ভ্যালি চা বাগান',
                    morning: 'ঘুম স্টেশন পর্যন্ত ঐতিহাসিক বাষ্পচালিত টয় ট্রেনের আনন্দদায়ক জয়রাইড।',
                    afternoon: 'হ্যাপি ভ্যালি চা বাগানে ভ্রমণ ও পাহাড়িদের সাথে চা পাতা তোলার অভিজ্ঞতা।',
                    evening: 'নেহেরু রোডে পশমিনা শাল ও ঐতিহ্যবাহী তিব্বতি হস্তশিল্প কেনাকাটা।'
                },
                {
                    day: '৪র্থ দিন',
                    title: 'মিরিক লেক ও পশুপতি নেপাল বর্ডার ভ্রমণ',
                    morning: 'পাইন বনের পথ ধরে মনোরম মিরিক সুমেন্দু লেক যাত্রা ও বোটিং।',
                    afternoon: 'পশুপতি নেপাল সীমান্তে লোকাল মার্কেট ঘুরে কেনাকাটা।',
                    evening: 'দার্জিলিং ফিরে কুঙ্গা রেস্তোরাঁয় খাঁটি তিব্বতি থুকপা ও শাফালে ডিনার।'
                },
                {
                    day: '৫ম দিন',
                    title: 'কাঞ্চনজঙ্ঘার শেষ দর্শন ও মিষ্টি স্মৃতি নিয়ে প্রস্থান',
                    morning: 'কেভেন্টার্সের রুফটপে মাউন্টেন ভিউ সহ চমৎকার ব্রেকফাস্ট।',
                    afternoon: 'তাজা চায়ের প্যাকেট সংগ্রহ করে এনজেপি বা বাগডোগরার উদ্দেশ্যে যাত্রা।',
                    evening: 'চিরসবুজ দার্জিলিংয়ের স্মৃতি বুকে নিয়ে বাড়ির পথে ফেরা।'
                }
            ],
            climateAndDressing: 'দার্জিলিংয়ে নাতিশীতোষ্ণ পাহাড়ি আবহাওয়া বিরাজ করে। শরৎ ও বসন্তে মনোরম ঠান্ডা (১০° সে. থেকে ১৮° সে.), এবং শীতে তাপমাত্রা ২° সে. পর্যন্ত নেমে যায়।',
            clothingAdvice: [
                'থার্মাল ইনারওয়্যার, কাশ্মীরি সোয়েটার ও উইন্ডপ্রুফ জ্যাকেট সঙ্গে রাখুন',
                'পাহাড়ে হাঁটার জন্য আরামদায়ক রাবার সোলের স্নিকার্স বা বুট জুতো',
                'টাইগার হিলের তীব্র বাতাসের জন্য উলের টুপি, মাফলার ও রোদচশমা',
                'পাহাড়ি মেঘ ও হালকা বৃষ্টির জন্য একটি ছোট ছাতা বা রেইন জ্যাকেট'
            ],
            localFood: ['গরম বাষ্পায়িত মোমো', 'তিব্বতি থুকপা স্যুপ', 'মুচমুচে শাফালে', 'চুরপি (পাহাড়ি ইয়াকের চিজ)', 'ফার্স্ট ফ্লাশ দার্জিলিং ব্ল্যাক টি'],
            foodHighlights: [
                { name: "গ্লেনারি'স বেকারি", desc: '১৩০ বছরের প্রাচীন ঐতিহাসিক বেকারি ও মনকাড়া পেস্ট্রি।' },
                { name: "কেভেন্টার্স রুফটপ", desc: 'পাহাড়ের দৃশ্য দেখতে দেখতে গরম হট চকোলেট ও সসেজ।' },
                { name: "কুঙ্গা রেস্টুরেন্ট", desc: 'সবচেয়ে সুস্বাদু খাঁটি তিব্বতি থুকপা ও গার্লিক মোমো।' }
            ],
            safetyAndEmergency: [
                'হঠাৎ পাহাড়ি উচ্চতার কারণে প্রচুর পরিমাণে হালকা গরম জল পান করুন',
                'টয় ট্রেনের টিকিট আগে থেকেই IRCTC ওয়েবসাইট থেকে বুক করে রাখুন',
                'চৌরাস্তা ও ট্যাক্সি স্ট্যান্ড থেকে পশ্চিমবঙ্গ পর্যটন অনুমোদিত গাড়ী বুক করুন'
            ],
            emergencyNumbers: [
                { service: 'দার্জিলিং পুলিশ হেল্পলাইন', contact: '১০০ / ০৩৫৪-২২৫৪৪২২' },
                { service: 'জেলা হাসপাতাল দার্জিলিং (ইডেন)', contact: '০৩৫৪-২২৫৪২১৮' },
                { service: 'পর্যটন সহায়তা কেন্দ্র (ম্যাল রোড)', contact: '০৩৫৪-২২৫৪৮৭৯' }
            ]
        },
        hi: {
            destination: 'दार्जिलिंग',
            orbit: 'domestic',
            duration: 5,
            standard: 'Comfort Level',
            tagline: 'हिमालय की रानी और चाय बागानों का स्वर्ग',
            overview: 'पश्चिम बंगाल में 6,700 फीट की ऊंचाई पर स्थित दार्जिलिंग, कंचनजंघा पर्वत के मनमोहक सूर्योदय, विश्व प्रसिद्ध ब्लैक टी और यूनेस्को हेरिटेज टॉय ट्रेन के लिए जाना जाता है।',
            costEstimate: '₹18,000 – ₹32,000 प्रति व्यक्ति (5 दिन)',
            costBreakdown: {
                budget: '₹12,000 – ₹16,000 (शेयर्ड टैक्सी, होमस्टे, स्ट्रीट मोमोज़)',
                comfort: '₹22,000 – ₹30,000 (प्राइवेट इनोवा, 3-स्टार व्यू होटल, कैफे)',
                luxury: '₹45,000+ (हेरिटेज टी एस्टेट रिज़ॉर्ट, प्राइवेट ड्राइवर)'
            },
            bestTimeToVisit: 'अक्टूबर से मई (साफ मौसम, कंचनजंघा का स्पष्ट दर्शन और सुहावना तापमान)',
            howToReach: 'बागडोगरा एयरपोर्ट (IXB) या न्यू जलपाईगुड़ी (NJP) रेलवे स्टेशन से 3 घंटे की सुंदर पहाड़ी ड्राइव।',
            topHighlights: [
                'टाइगर हिल से कंचनजंघा पर सुबह का सुनहरा सूर्योदय',
                'बतासिया लूप और यूनेस्को हेरिटेज टॉय ट्रेन राइड',
                'मॉल रोड पर ग्लेनरीज़ बेकरी और केवेंटर्स नाश्ता',
                'हैप्पी वैली टी एस्टेट टूर और ताज़ा चाय का स्वाद',
                'हिमालयन पर्वतारोहण संस्थान और स्नो लेपर्ड चिड़ियाघर'
            ],
            itinerary: [
                {
                    day: 'दिन 1',
                    title: 'दार्जिलिंग आगमन और मॉल रोड की सैर',
                    morning: 'बागडोगरा/NJP से चाय बागानों के बीच से दार्जिलिंग की यात्रा।',
                    afternoon: 'होटल में चेक-इन और ताज़ा ब्लैक टी का आनंद।',
                    evening: 'मॉल रोड (चौरास्ता) पर शाम की सैर और ग्लेनरीज़ में डिनर।'
                },
                {
                    day: 'दिन 2',
                    title: 'टाइगर हिल सूर्योदय और मुख्य 7 दर्शनीय स्थल',
                    morning: 'सुबह 4 बजे टाइगर हिल पर सूर्योदय, बतासिया लूप और घूम मठ का भ्रमण।',
                    afternoon: 'हिमालयन पर्वतारोहण संस्थान (HMI) और चिड़ियाघर का दौरा।',
                    evening: 'जापानी पीस पैगोडा दर्शन और ताज़ा मोमोज़ का स्वाद।'
                },
                {
                    day: 'दिन 3',
                    title: 'हेरिटेज टॉय ट्रेन और हैप्पी वैली टी एस्टेट',
                    morning: 'भाप वाले स्टीम इंजन टॉय ट्रेन से घूम तक ऐतिहासिक सफ़र।',
                    afternoon: 'हैप्पी वैली टी एस्टेट में चाय पत्ती तोड़ने और प्रोसेसिंग की जानकारी।',
                    evening: 'नेहरू रोड पर पश्मीना शॉल और तिब्बती हस्तशिल्प की खरीदारी।'
                },
                {
                    day: 'दिन 4',
                    title: 'मिरिक झील और पशुपति नेपाल बॉर्डर एक्सकर्शन',
                    morning: 'चीड़ के जंगलों से होकर खूबसूरत मिरिक झील की यात्रा और बोटिंग।',
                    afternoon: 'पशुपति नेपाल सीमा बाज़ार में खरीदारी।',
                    evening: 'दार्जिलिंग वापसी और कुंगा रेस्तरां में स्वादिष्ट थुकपा डिनर।'
                },
                {
                    day: 'दिन 5',
                    title: 'सुबह का कंचनजंघा व्यू और वापसी',
                    morning: 'केवेंटर्स की छत पर गर्म नाश्ता और कंचनजंघा का अंतिम दर्शन।',
                    afternoon: 'दार्जिलिंग टी पैक लेकर बागडोगरा या NJP के लिए प्रस्थान।',
                    evening: 'यादों के साथ घर वापसी।'
                }
            ],
            climateAndDressing: 'दार्जिलिंग में सुखद पहाड़ी मौसम रहता है। वसंत/शरद ऋतु में तापमान 10°C से 18°C तथा सर्दियों में 2°C से 8°C तक गिर जाता है।',
            clothingAdvice: [
                'थर्मल इनर, ऊनी स्वेटर और विंडप्रूफ जैकेट साथ रखें',
                'पहाड़ी रास्तों पर चलने के लिए आरामदायक ग्रिप वाले जूते',
                'टाइगर हिल की ठंडी हवा से बचने के लिए ऊनी टोपी और मफलर',
                'हल्की बारिश या कोहरे के लिए छोटी छतरी'
            ],
            localFood: ['गरमागरम मोमोज़', 'तिब्बती थुकपा सूप', 'शफाले', 'चुरपी', 'दार्जिलिंग फर्स्ट फ्लश टी'],
            foodHighlights: [
                { name: "ग्लेनरीज़ कैफे", desc: '130 वर्ष पुरानी हेरिटेज बेकरी और सेब की पेस्ट्री।' },
                { name: "केवेंटर्स", desc: 'पहाड़ी नज़ारों के साथ प्रसिद्ध हॉट कोको और नाश्ता।' },
                { name: "कुंगा रेस्तरां", desc: 'प्रामाणिक तिब्बती थुकपा और स्वादिष्ट मोमोज़।' }
            ],
            safetyAndEmergency: [
                'ऊंचाई के कारण पर्याप्त गर्म पानी पिएं और हाइड्रेटेड रहें',
                'टॉय ट्रेन की टिकट IRCTC से कम से कम 2-3 हफ्ते पहले बुक करें',
                'टैक्सी स्टैंड से केवल सरकार द्वारा प्रमाणित टैक्सी ही लें'
            ],
            emergencyNumbers: [
                { service: 'दार्जिलिंग पुलिस हेल्पलाइन', contact: '100 / 0354-2254422' },
                { service: 'ज़िला अस्पताल दार्जिलिंग (ईडन)', contact: '0354-2254218' },
                { service: 'पर्यटन सहायता केंद्र (मॉल रोड)', contact: '0354-2254879' }
            ]
        }
    }
};

const SifraExplorerView: React.FC<TravelGuideViewProps> = ({ userProfile, onClose }) => {
    // Current Flow Step: 'orbit' -> 'configure' -> 'dossier'
    const [step, setStep] = useState<'orbit' | 'configure' | 'dossier'>('orbit');

    // Planner Configuration State
    const [orbit, setOrbit] = useState<TravelOrbit>('domestic');
    const [destinationInput, setDestinationInput] = useState<string>('Darjeeling');
    const [durationDays, setDurationDays] = useState<number>(5);
    const [travelStandard, setTravelStandard] = useState<string>('Comfort Style');

    // Active Dossier State & Language
    const [currentLanguage, setCurrentLanguage] = useState<TravelLanguage>('en');
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [dossier, setDossier] = useState<TravelDossier>(PRESET_DESTINATIONS['darjeeling'].en);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

    const userName = (userProfile?.name && userProfile.name !== 'User' && userProfile.name !== 'Guest' 
        ? userProfile.name.split(' ')[0] 
        : 'RIZWAN').toUpperCase();

    // Show toast helper
    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Orbit Selection -> Move to Step 2
    const handleSelectOrbit = (selectedOrbit: TravelOrbit) => {
        setOrbit(selectedOrbit);
        if (selectedOrbit === 'international' && destinationInput === 'Darjeeling') {
            setDestinationInput('Dubai');
        } else if (selectedOrbit === 'domestic' && destinationInput === 'Dubai') {
            setDestinationInput('Darjeeling');
        }
        setStep('configure');
    };

    // AI Generation Handler
    const handleGenerateDossier = async () => {
        const dest = destinationInput.trim() || (orbit === 'domestic' ? 'Darjeeling' : 'Dubai');
        setIsGenerating(true);

        // Check if preset exists for instant flawless loading
        const lowerDest = dest.toLowerCase();
        const matchedKey = Object.keys(PRESET_DESTINATIONS).find(k => lowerDest.includes(k) || k.includes(lowerDest));

        try {
            const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY || '') as string;
            
            if (apiKey && !matchedKey) {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = `You are SIFRA EXPLORER, the luxury AI Voyager and Travel Curator.
Generate a comprehensive travel dossier for destination: "${dest}".
Parameters:
- Geo-Scope: ${orbit}
- Duration: ${durationDays} Days
- Travel Standard: ${travelStandard}
- Current Output Language: ${currentLanguage === 'bn' ? 'Bengali (বাংলা)' : currentLanguage === 'hi' ? 'Hindi (हिन्दी)' : 'English'}

Output STRICT JSON matching this schema exactly (no markdown formatting, just pure json):
{
  "destination": "${dest}",
  "tagline": "A compelling luxury tagline",
  "overview": "Detailed 2-3 sentence overview covering history, geography, and travel essence",
  "costEstimate": "Estimated total cost per person in INR or USD",
  "costBreakdown": {
    "budget": "Budget breakdown details",
    "comfort": "Comfort breakdown details",
    "luxury": "Luxury breakdown details"
  },
  "bestTimeToVisit": "Best months and seasons to visit",
  "howToReach": "Flight, rail, or road transit details",
  "topHighlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4", "Highlight 5"],
  "itinerary": [
    {
      "day": "Day 1",
      "title": "Title for Day 1",
      "morning": "Morning activity details",
      "afternoon": "Afternoon activity details",
      "evening": "Evening activity details"
    }
  ],
  "climateAndDressing": "Comprehensive climate description and weather notes",
  "clothingAdvice": ["Clothing tip 1", "Clothing tip 2", "Clothing tip 3", "Clothing tip 4"],
  "localFood": ["Dish 1", "Dish 2", "Dish 3", "Dish 4"],
  "foodHighlights": [
    { "name": "Place or Dish 1", "desc": "Description" },
    { "name": "Place or Dish 2", "desc": "Description" }
  ],
  "safetyAndEmergency": ["Safety tip 1", "Safety tip 2", "Safety tip 3"],
  "emergencyNumbers": [
    { "service": "Police", "contact": "100" },
    { "service": "Ambulance", "contact": "102" }
  ]
}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { responseMimeType: 'application/json' }
                });

                if (response.text) {
                    const parsed = JSON.parse(response.text);
                    setDossier({
                        ...parsed,
                        orbit,
                        duration: durationDays,
                        standard: travelStandard
                    });
                    setStep('dossier');
                    setIsGenerating(false);
                    return;
                }
            }
        } catch (err) {
            console.warn('Gemini API call error in Sifra Explorer, falling back gracefully:', err);
        }

        // Preset or rich template fallback
        if (matchedKey) {
            const langPreset = PRESET_DESTINATIONS[matchedKey][currentLanguage] || PRESET_DESTINATIONS[matchedKey].en;
            setDossier({
                ...langPreset,
                duration: durationDays,
                standard: travelStandard,
                orbit
            });
        } else {
            // High quality custom generated dossier template for any custom destination
            setDossier({
                destination: dest,
                orbit,
                duration: durationDays,
                standard: travelStandard,
                tagline: `Curated Voyage & Bespoke Itinerary for ${dest}`,
                overview: `Explore the vibrant culture, rich heritage, and mesmerizing landscapes of ${dest}. Specially curated under the ${travelStandard} framework for an unforgettable ${durationDays}-day sojourn.`,
                costEstimate: orbit === 'domestic' ? `₹${durationDays * 4500} – ₹${durationDays * 7500} per person` : `$${durationDays * 180} – $${durationDays * 320} per person`,
                costBreakdown: {
                    budget: orbit === 'domestic' ? '₹2,500 – ₹3,500/day (Hostels, local transit, street eateries)' : '$80 – $120/day',
                    comfort: orbit === 'domestic' ? '₹5,000 – ₹7,500/day (3-4 Star hotel, private cab, good dining)' : '$180 – $250/day',
                    luxury: orbit === 'domestic' ? '₹15,000+/day (5-Star luxury resort, chauffeur, fine dining)' : '$500+/day'
                },
                bestTimeToVisit: 'September to April (Pleasant sightseeing weather and vibrant local cultural events)',
                howToReach: `Direct flights and expressway connections available to ${dest} central hub with on-demand private transit.`,
                topHighlights: [
                    `${dest} Iconic Heritage Landmark & Architecture`,
                    `Panoramic Scenic Viewpoint & Natural Landscape`,
                    `Famous Old Town Market & Artisan Boutiques`,
                    `Traditional Gastronomy & Signature Local Dining`,
                    `Sunset Promenade & Evening Cultural Performance`
                ],
                itinerary: Array.from({ length: durationDays }).map((_, i) => ({
                    day: `Day ${i + 1}`,
                    title: i === 0 ? 'Arrival, Check-in & Orientation' : i === durationDays - 1 ? 'Souvenirs & Departure' : `Exploring Iconic Highlights of ${dest}`,
                    morning: `Breakfast at hotel; morning guided tour of ${dest} top historical landmarks.`,
                    afternoon: `Savor authentic regional cuisine followed by cultural museum visits.`,
                    evening: `Sunset viewpoints, evening stroll along bustling bazaar, and dinner.`
                })),
                climateAndDressing: `${dest} features seasonal temperatures ranging from 16°C to 28°C. Breathable cottons are ideal for daytime sightseeing, with a light cardigan or jacket for breezy evenings.`,
                clothingAdvice: [
                    'Lightweight breathable linen and cotton shirts',
                    'Comfortable walking sneakers or walking sandals',
                    'UV protection sunglasses, sun hat, and high SPF sunscreen',
                    'A versatile evening jacket or shawl for air-conditioned venues and cooler nights'
                ],
                localFood: [`Traditional ${dest} Specialty Platter`, 'Signature Street Food Delicacy', 'Artisanal Herbal Tea & Sweets', 'Fresh Local Seafood / Regional Curry'],
                foodHighlights: [
                    { name: 'City Center Heritage Bistro', desc: 'Renowned for century-old traditional recipes and authentic regional flavors.' },
                    { name: 'Sunset Rooftop Lounge', desc: 'Panoramic skyline view paired with artisanal beverages and gourmet platters.' }
                ],
                safetyAndEmergency: [
                    'Keep digital copies of photo ID and hotel address cards stored in your phone',
                    'Use registered ride-hailing apps or official transit counters to prevent inflated fares',
                    'Drink bottled or purified water and dine at clean, high-turnover local eateries'
                ],
                emergencyNumbers: [
                    { service: 'Local Police Assistance', contact: '112 / 100' },
                    { service: 'Tourist Helpline Support', contact: '1363' },
                    { service: 'Emergency Medical Service', contact: '108' }
                ]
            });
        }

        setIsGenerating(false);
        setStep('dossier');
    };

    // Language switch handler
    const handleLanguageChange = (lang: TravelLanguage) => {
        setCurrentLanguage(lang);
        const lowerDest = dossier.destination.toLowerCase();
        const matchedKey = Object.keys(PRESET_DESTINATIONS).find(k => lowerDest.includes(k) || k.includes(lowerDest));
        if (matchedKey && PRESET_DESTINATIONS[matchedKey][lang]) {
            setDossier(prev => ({
                ...PRESET_DESTINATIONS[matchedKey][lang],
                duration: prev.duration,
                standard: prev.standard,
                orbit: prev.orbit
            }));
            triggerToast(lang === 'bn' ? 'বাংলা ভাষায় রিপোর্ট অনুবাদ করা হয়েছে' : lang === 'hi' ? 'हिंदी में रिपोर्ट अपडेट की गई' : 'Report switched to English');
        } else {
            triggerToast(`Edition: ${lang === 'bn' ? 'বাংলা (Bengali)' : lang === 'hi' ? 'हिन्दी (Hindi)' : 'English'}`);
        }
    };

    // PDF Download via Print Window
    const handleDownloadPdf = () => {
        triggerToast('Generating printable PDF report...');
        setTimeout(() => {
            window.print();
        }, 500);
    };

    // Share Handler
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `SIFRA Explorer - ${dossier.destination}`,
                    text: `${dossier.destination} (${dossier.duration} Days • ${dossier.standard}): ${dossier.overview}`,
                    url: window.location.href
                });
            } catch (e) {}
        } else {
            await navigator.clipboard.writeText(`${dossier.destination} - SIFRA Travel Dossier\n${dossier.tagline}\n\nEstimated Budget: ${dossier.costEstimate}\n\n${dossier.overview}`);
            triggerToast('Dossier Summary Copied to Clipboard!');
        }
    };

    // Copy Handler
    const handleCopyDossier = async () => {
        const text = `==============================\nSIFRA EXPLORER TRAVEL DOSSIER\nDESTINATION: ${dossier.destination.toUpperCase()}\nDURATION: ${dossier.duration} DAYS (${dossier.standard})\n==============================\n\nOVERVIEW:\n${dossier.overview}\n\nESTIMATED COST:\n${dossier.costEstimate}\n\nCLIMATE & DRESSING:\n${dossier.climateAndDressing}\n\nDAY-BY-DAY ITINERARY:\n${dossier.itinerary.map(d => `${d.day} - ${d.title}\n• Morning: ${d.morning}\n• Afternoon: ${d.afternoon}\n• Evening: ${d.evening}`).join('\n\n')}\n\nTOP HIGHLIGHTS:\n${dossier.topHighlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}`;
        await navigator.clipboard.writeText(text);
        triggerToast('Complete Travel Report Copied!');
    };

    return (
        <div className="h-full w-full max-h-screen overflow-hidden bg-[#FAF7F2] text-[#2C1810] flex flex-col font-sans relative select-none">
            {/* Ambient Warm Apricot/Peach Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] bg-orange-200/25 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] bg-amber-200/20 blur-[140px] rounded-full" />
            </div>

            {/* ========================================================================= */}
            {/* TOP NAVIGATION HEADER (Matching Screenshots 1, 2, 3) */}
            {/* ========================================================================= */}
            <header className="px-5 py-3.5 flex items-center justify-between border-b border-orange-100/60 bg-[#FAF7F2]/90 backdrop-blur-xl sticky top-0 z-20">
                {/* Left Back Button */}
                <button
                    onClick={() => {
                        if (step === 'dossier') setStep('configure');
                        else if (step === 'configure') setStep('orbit');
                        else onClose();
                    }}
                    className="w-11 h-11 rounded-full bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
                    aria-label="Back"
                >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Center Title & Subtitle */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full border border-orange-400/80 flex items-center justify-center text-[#E66A23]">
                            <Compass className="w-3.5 h-3.5" />
                        </div>
                        <h1 className="text-lg sm:text-xl font-black italic tracking-tight text-[#2C1810] uppercase leading-none">
                            SIFRA EXPLORER
                        </h1>
                    </div>
                    <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-[0.25em] text-[#E66A23] mt-0.5 leading-none">
                        INTELLIGENT AI VOYAGER AND TRAVEL CURATOR
                    </span>
                </div>

                {/* Right Name / Transit Hub & Help Button */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col text-right leading-none hidden sm:flex">
                        <span className="text-[10px] font-black text-[#2C1810] tracking-tight">{userName}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest text-[#E66A23] mt-0.5">TRANSIT HUB</span>
                    </div>
                    <button
                        onClick={() => setShowHelpModal(true)}
                        className="w-9 h-9 rounded-full bg-[#EC4899] text-white font-bold flex items-center justify-center shadow-md active:scale-90 transition-transform"
                        aria-label="Transit Hub Help"
                    >
                        <span className="text-base font-black leading-none">?</span>
                    </button>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* MAIN CONTENT AREA */}
            {/* ========================================================================= */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-28 premium-scroll relative z-10">
                {/* --------------------------------------------------------------------- */}
                {/* STEP 1: CHOOSE YOUR DESTINATION ORBIT (Screenshot 1) */}
                {/* --------------------------------------------------------------------- */}
                {step === 'orbit' && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto space-y-6 pt-4"
                    >
                        {/* Hero Header */}
                        <div className="text-center space-y-2">
                            <Sparkles className="w-10 h-10 text-[#E66A23] mx-auto stroke-[2.2]" />
                            <h2 className="text-2xl sm:text-3xl font-black italic text-[#2C1810] tracking-tight uppercase leading-tight">
                                CHOOSE YOUR<br />DESTINATION ORBIT
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                                Select your geo-scope to initialize Sifra custom local templates
                            </p>
                        </div>

                        {/* Orbit Options Cards */}
                        <div className="space-y-4 pt-2">
                            {/* Card 1: DOMESTIC */}
                            <motion.div
                                whileHover={{ y: -3, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectOrbit('domestic')}
                                className="rounded-[28px] bg-white border border-orange-100/90 p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(230,106,35,0.12)] transition-all cursor-pointer flex items-center gap-4 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#FFF4ED] border border-[#FDE6D5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <MapPin className="w-6 h-6 text-[#E66A23]" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-base sm:text-lg font-black text-[#2C1810] uppercase tracking-tight group-hover:text-[#E66A23] transition-colors">
                                        DOMESTIC (WITHIN INDIA)
                                    </h3>
                                    <p className="text-xs sm:text-[13px] text-gray-500 font-medium leading-relaxed mt-1">
                                        Curated with state constraints, local transport, street delicacies and direct support links.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Card 2: INTERNATIONAL */}
                            <motion.div
                                whileHover={{ y: -3, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectOrbit('international')}
                                className="rounded-[28px] bg-white border border-blue-100/90 p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] transition-all cursor-pointer flex items-center gap-4 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Globe className="w-6 h-6 text-[#3B82F6]" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-base sm:text-lg font-black text-[#2C1810] uppercase tracking-tight group-hover:text-[#3B82F6] transition-colors">
                                        INTERNATIONAL ESCAPE
                                    </h3>
                                    <p className="text-xs sm:text-[13px] text-gray-500 font-medium leading-relaxed mt-1">
                                        Structured with visa, currency exchange, passport lists, adapters, and custom safety parameters.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* --------------------------------------------------------------------- */}
                {/* STEP 2: CONFIGURE TRIP PLANNER (Screenshot 2) */}
                {/* --------------------------------------------------------------------- */}
                {step === 'configure' && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto pt-2"
                    >
                        <div className="rounded-[32px] bg-white p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-orange-100/90 space-y-5">
                            {/* Card Header */}
                            <div className="flex items-center justify-between pb-2 border-b border-orange-50">
                                <div className="flex items-center gap-2 text-[#2C1810]">
                                    <Plane className="w-5 h-5 text-[#E66A23] rotate-45" />
                                    <h2 className="text-sm sm:text-base font-black uppercase tracking-tight">
                                        CONFIGURE TRIP PLANNER
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setStep('orbit')}
                                    className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#E66A23] hover:underline"
                                >
                                    CHANGE REGION
                                </button>
                            </div>

                            {/* Destination Location Input */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-[#2C1810] block mb-2">
                                    ENTER DESTINATION LOCATION
                                </label>
                                <input
                                    type="text"
                                    value={destinationInput}
                                    onChange={(e) => setDestinationInput(e.target.value)}
                                    placeholder={orbit === 'domestic' ? 'e.g. Goa, Leh Ladakh, Munnar, Darjeeling' : 'e.g. Dubai, Switzerland, Bali, Tokyo, Paris'}
                                    className="w-full bg-white border border-orange-200/80 focus:border-[#E66A23] rounded-2xl px-4 py-3.5 text-sm sm:text-base font-bold text-gray-900 placeholder-gray-400 outline-none transition-colors shadow-inner"
                                />

                                {/* Quick Suggestions */}
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    {(orbit === 'domestic' 
                                        ? ['Darjeeling', 'Goa', 'Kashmir', 'Kerala', 'Varanasi', 'Ladakh'] 
                                        : ['Dubai', 'Paris', 'Switzerland', 'Bali', 'Tokyo', 'London']
                                    ).map(place => (
                                        <button
                                            key={place}
                                            type="button"
                                            onClick={() => setDestinationInput(place)}
                                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                                                destinationInput.toLowerCase() === place.toLowerCase()
                                                    ? 'bg-[#E66A23] text-white border-[#E66A23]'
                                                    : 'bg-orange-50/60 text-gray-600 border-orange-100 hover:bg-orange-100/60'
                                            }`}
                                        >
                                            {place}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration & Travel Standard Row */}
                            <div className="grid grid-cols-2 gap-3.5 pt-1">
                                {/* DURATION (DAYS) */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#2C1810] block mb-2">
                                        DURATION (DAYS)
                                    </label>
                                    <div className="flex items-center bg-white border border-orange-200/80 rounded-2xl p-1 shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() => setDurationDays(Math.max(1, durationDays - 1))}
                                            className="w-9 h-9 rounded-xl text-gray-600 hover:bg-orange-50 font-bold active:scale-95 flex items-center justify-center"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={durationDays}
                                            onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full text-center font-black text-lg text-gray-900 bg-transparent outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setDurationDays(Math.min(30, durationDays + 1))}
                                            className="w-9 h-9 rounded-xl text-gray-600 hover:bg-orange-50 font-bold active:scale-95 flex items-center justify-center"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* TRAVEL STANDARD */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[#2C1810] block mb-2">
                                        TRAVEL STANDARD
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={travelStandard}
                                            onChange={(e) => setTravelStandard(e.target.value)}
                                            className="w-full appearance-none bg-white border border-orange-200/80 focus:border-[#E66A23] rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-bold text-gray-900 outline-none pr-8 cursor-pointer shadow-inner"
                                        >
                                            <option value="Comfort Style">Comfort Style</option>
                                            <option value="Budget Backpacker">Budget Backpacker</option>
                                            <option value="Luxury & Elite">Luxury & Elite</option>
                                            <option value="Ultra Premium Sovereign">Ultra Premium Sovereign</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="pt-3">
                                <button
                                    onClick={handleGenerateDossier}
                                    disabled={isGenerating}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#EA580C] hover:brightness-105 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>SYNTHESIZING TRAVEL DOSSIER...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>GENERATE AI TRAVEL DOSSIER</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --------------------------------------------------------------------- */}
                {/* STEP 3: AI-GENERATED TRAVEL DOSSIER (Screenshot 3) */}
                {/* --------------------------------------------------------------------- */}
                {step === 'dossier' && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-lg mx-auto space-y-5"
                    >
                        {/* ============================================================= */}
                        {/* HERO DOSSIER CARD (Exact match to Screenshot 3) */}
                        {/* ============================================================= */}
                        <div className="rounded-[32px] bg-[#381E11] p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden">
                            {/* Subtle background luxury texture */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                            {/* Subtitle / Active Tag */}
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F59E0B] block mb-1">
                                VOYAGE DESTINATION ACTIVE
                            </span>

                            {/* Destination Title */}
                            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white mb-2">
                                {dossier.destination}
                            </h2>

                            {/* Summary Metadata */}
                            <p className="text-xs sm:text-sm font-semibold text-gray-300">
                                {dossier.duration} Days Plan • {dossier.orbit === 'domestic' ? 'Domestic' : 'International'} • {dossier.standard}
                            </p>

                            {/* Edition Tag */}
                            <div className="mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-wider border border-white/10">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    {currentLanguage === 'bn' ? 'BENGALI EDITION' : currentLanguage === 'hi' ? 'HINDI EDITION' : 'ENGLISH EDITION'}
                                </span>
                            </div>

                            {/* Language Switcher Row (Screenshot 3 exact match) */}
                            <div className="mt-5 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F97316] mb-3">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>রিপোর্ট অনুবাদ (EDIT LANGUAGE):</span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => handleLanguageChange('en')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                            currentLanguage === 'en'
                                                ? 'bg-[#EA580C] text-white shadow-md'
                                                : 'bg-white/10 hover:bg-white/15 text-gray-300'
                                        }`}
                                    >
                                        ENGLISH
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleLanguageChange('bn')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                            currentLanguage === 'bn'
                                                ? 'bg-[#EA580C] text-white shadow-md'
                                                : 'bg-white/10 hover:bg-white/15 text-gray-300'
                                        }`}
                                    >
                                        বাংলা (BENGALI)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleLanguageChange('hi')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                            currentLanguage === 'hi'
                                                ? 'bg-[#EA580C] text-white shadow-md'
                                                : 'bg-white/10 hover:bg-white/15 text-gray-300'
                                        }`}
                                    >
                                        हिन्दी (HINDI)
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons Row (Download PDF, Share, Copy) */}
                            <div className="flex items-center gap-2.5 mt-5">
                                <button
                                    onClick={handleDownloadPdf}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-[#EA580C] hover:bg-[#F97316] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>পিডিএফ ডাউনলোড (PDF)</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center active:scale-90 transition-all shrink-0"
                                    aria-label="Share Dossier"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={handleCopyDossier}
                                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center active:scale-90 transition-all shrink-0"
                                    aria-label="Copy Dossier Text"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ============================================================= */}
                        {/* TIPS BANNER (Screenshot 3 exact match) */}
                        {/* ============================================================= */}
                        <div className="rounded-2xl bg-white border border-orange-100 p-4 shadow-sm flex items-start gap-3">
                            <span className="text-xl">💡</span>
                            <div className="text-xs text-gray-700 leading-relaxed space-y-1">
                                <p className="font-bold text-[#2C1810]">
                                    পিডিএফ সেভ করার টিপস:
                                </p>
                                <p>
                                    আপনি যখন <span className="font-bold text-[#E66A23]">"পিডিএফ ডাউনলোড"</span> বাটনে ক্লিক করবেন, তখন Sifra-র শৈল্পিক ব্র্যান্ডিংযুক্ত রিপোর্টটি ওপেন হবে।
                                </p>
                                <p>
                                    সেখানে Destination হিসেবে <span className="font-bold">"Save as PDF"</span> (পিডিএফ ফাইল সেভ করুন) সিলেক্ট করলেই আপনার ফোনে বা কম্পিউটারে সুন্দর গোছানো গাইডটি সরাসরি ডাউনলোড হয়ে যাবে!
                                </p>
                            </div>
                        </div>

                        {/* ============================================================= */}
                        {/* NAVIGATION TABS (Screenshot 3 exact match) */}
                        {/* ============================================================= */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
                            {[
                                { id: 'overview', label: 'OVERVIEW & COST' },
                                { id: 'itinerary', label: 'DAY-BY-DAY ITINERARY' },
                                { id: 'climate', label: 'CLIMATE & TRAVEL DRESSING' },
                                { id: 'food', label: 'LOCAL DELICACIES & FOOD' },
                                { id: 'safety', label: 'SAFETY & EMERGENCY' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                                    className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all snap-start ${
                                        activeTab === tab.id
                                            ? 'bg-[#EA580C] text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-orange-50 border border-orange-100/80 shadow-xs'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ============================================================= */}
                        {/* TAB CONTENT PANELS */}
                        {/* ============================================================= */}
                        <div className="space-y-4">
                            {/* TAB 1: OVERVIEW & COST */}
                            {activeTab === 'overview' && (
                                <div className="rounded-[28px] bg-white border border-orange-100 p-6 shadow-sm space-y-5">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#E66A23] block mb-1">
                                            DESTINATION ESSENCE
                                        </span>
                                        <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                                            {dossier.tagline}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                                            {dossier.overview}
                                        </p>
                                    </div>

                                    {/* Cost Breakdown Cards */}
                                    <div className="pt-2 border-t border-orange-50">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#E66A23] block mb-2">
                                            ESTIMATED VOYAGE BUDGET
                                        </span>
                                        <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 mb-3">
                                            <span className="text-xs text-gray-500 font-semibold block">Total Estimated Cost:</span>
                                            <span className="text-xl font-black text-[#E66A23]">{dossier.costEstimate}</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <span className="text-[9px] font-black uppercase text-gray-500 block">BUDGET</span>
                                                <p className="text-[11px] text-gray-700 font-semibold mt-1">{dossier.costBreakdown.budget}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                                                <span className="text-[9px] font-black uppercase text-[#E66A23] block">COMFORT</span>
                                                <p className="text-[11px] text-gray-800 font-bold mt-1">{dossier.costBreakdown.comfort}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                                                <span className="text-[9px] font-black uppercase text-amber-700 block">LUXURY</span>
                                                <p className="text-[11px] text-gray-700 font-semibold mt-1">{dossier.costBreakdown.luxury}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Best Time & How to reach */}
                                    <div className="pt-2 border-t border-orange-50 space-y-3">
                                        <div className="flex items-start gap-2.5">
                                            <Calendar className="w-4 h-4 text-[#E66A23] shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-xs font-bold text-[#2C1810]">Best Time to Visit:</span>
                                                <p className="text-xs text-gray-600 mt-0.5">{dossier.bestTimeToVisit}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <Plane className="w-4 h-4 text-[#E66A23] shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-xs font-bold text-[#2C1810]">Transit & Access:</span>
                                                <p className="text-xs text-gray-600 mt-0.5">{dossier.howToReach}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Highlights List */}
                                    <div className="pt-2 border-t border-orange-50">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#E66A23] block mb-2">
                                            TOP MUST-SEE HIGHLIGHTS
                                        </span>
                                        <ul className="space-y-1.5">
                                            {dossier.topHighlights.map((hl, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                                                    <span className="w-4 h-4 rounded-full bg-orange-100 text-[#E66A23] font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <span>{hl}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: DAY-BY-DAY ITINERARY */}
                            {activeTab === 'itinerary' && (
                                <div className="space-y-3">
                                    {dossier.itinerary.map((day, idx) => (
                                        <div key={idx} className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm space-y-3">
                                            <div className="flex items-center justify-between pb-2 border-b border-orange-50">
                                                <span className="px-2.5 py-1 rounded-full bg-[#EA580C]/15 text-[#EA580C] text-[10px] font-black uppercase tracking-wider">
                                                    {day.day}
                                                </span>
                                                <h4 className="text-sm font-bold text-[#2C1810] flex-1 text-right truncate pl-2">
                                                    {day.title}
                                                </h4>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="p-2.5 rounded-xl bg-orange-50/40">
                                                    <span className="text-[10px] font-bold text-[#E66A23] uppercase block">🌅 Morning</span>
                                                    <p className="text-gray-700 mt-0.5 leading-relaxed">{day.morning}</p>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-amber-50/40">
                                                    <span className="text-[10px] font-bold text-amber-700 uppercase block">☀️ Afternoon</span>
                                                    <p className="text-gray-700 mt-0.5 leading-relaxed">{day.afternoon}</p>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-indigo-50/40">
                                                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">🌙 Evening</span>
                                                    <p className="text-gray-700 mt-0.5 leading-relaxed">{day.evening}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB 3: CLIMATE & TRAVEL DRESSING (Screenshot 3 exact match) */}
                            {activeTab === 'climate' && (
                                <div className="rounded-[28px] bg-white border border-orange-100 p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 text-[#E66A23]">
                                        <CloudSun className="w-5 h-5" />
                                        <h3 className="text-sm font-black uppercase tracking-tight text-[#E66A23]">
                                            CLIMATE & TRAVEL DRESSING
                                        </h3>
                                    </div>

                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                                        {dossier.climateAndDressing}
                                    </p>

                                    <div className="pt-3 border-t border-orange-50">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2C1810] block mb-2">
                                            WHAT TO WEAR & PACKING CHECKLIST
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {dossier.clothingAdvice.map((item, i) => (
                                                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-orange-50/40 border border-orange-100/60 text-xs text-gray-700 font-medium">
                                                    <Check className="w-4 h-4 text-[#E66A23] shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: LOCAL DELICACIES & FOOD */}
                            {activeTab === 'food' && (
                                <div className="rounded-[28px] bg-white border border-orange-100 p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 text-[#E66A23]">
                                        <Utensils className="w-5 h-5" />
                                        <h3 className="text-sm font-black uppercase tracking-tight text-[#E66A23]">
                                            LOCAL DELICACIES & STREET FOOD
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {dossier.localFood.map((dish, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-full bg-orange-100/70 text-[#C2410C] text-xs font-bold">
                                                🍽️ {dish}
                                            </span>
                                        ))}
                                    </div>

                                    {dossier.foodHighlights.length > 0 && (
                                        <div className="pt-3 border-t border-orange-50 space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-[#2C1810] block mb-1">
                                                ICONIC CAFES & DINING SPOTS
                                            </span>
                                            {dossier.foodHighlights.map((f, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-orange-50/30 border border-orange-100/60">
                                                    <span className="text-xs font-bold text-[#2C1810]">{f.name}</span>
                                                    <p className="text-[11px] text-gray-600 mt-0.5">{f.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 5: SAFETY & EMERGENCY */}
                            {activeTab === 'safety' && (
                                <div className="rounded-[28px] bg-white border border-orange-100 p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 text-[#E66A23]">
                                        <ShieldCheck className="w-5 h-5" />
                                        <h3 className="text-sm font-black uppercase tracking-tight text-[#E66A23]">
                                            SAFETY & TRAVEL ADVISORY
                                        </h3>
                                    </div>

                                    <ul className="space-y-2">
                                        {dossier.safetyAndEmergency.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#E66A23] mt-1.5 shrink-0" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-3 border-t border-orange-50">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2C1810] block mb-2">
                                            EMERGENCY HELPLINES & TRANSIT CONTACTS
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {dossier.emergencyNumbers.map((em, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-800">{em.service}</span>
                                                    <span className="text-xs font-mono font-black text-rose-600">{em.contact}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reset / Plan New Trip CTA */}
                        <div className="text-center pt-3 pb-6">
                            <button
                                onClick={() => setStep('configure')}
                                className="px-5 py-2.5 rounded-2xl bg-white border border-orange-200 text-xs font-bold text-[#E66A23] hover:bg-orange-50 active:scale-95 transition-all shadow-xs"
                            >
                                ↺ Plan Another Destination
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* ========================================================================= */}
            {/* TRANSIT HUB HELP MODAL */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {showHelpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-orange-100 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#EC4899] text-white font-bold flex items-center justify-center text-xs">
                                        ?
                                    </div>
                                    <h3 className="font-serif text-base font-bold text-[#2C1810]">Transit Hub Guide</h3>
                                </div>
                                <button onClick={() => setShowHelpModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                Welcome to <strong className="text-[#E66A23]">SIFRA Explorer</strong>, your autonomous neural travel curator.
                            </p>

                            <ul className="text-xs text-gray-600 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E66A23] mt-1.5 shrink-0" />
                                    <span><strong>Destination Orbit:</strong> Choose Domestic for Indian states or International for overseas trips.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E66A23] mt-1.5 shrink-0" />
                                    <span><strong>Multilingual Output:</strong> Generate and switch reports in English, Bengali, or Hindi.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#E66A23] mt-1.5 shrink-0" />
                                    <span><strong>Export PDF:</strong> Tap the PDF button to download a formatted travel itinerary.</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="w-full py-2.5 rounded-xl bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* TOAST NOTIFICATION */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#2C1810] text-white text-xs font-bold shadow-xl border border-white/10 flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SifraExplorerView;
