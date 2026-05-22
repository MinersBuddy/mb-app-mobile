import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import {
  X,
  Search,
  MapPin,
  List,
  Map,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Navigation,
  HeartPulse,
} from 'lucide-react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FirstAidNavProp = NativeStackNavigationProp<RootStackParamList, 'FirstAid'>;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  navy: '#0F1923',
  navyMid: '#1A2B3C',
  navyLight: '#243447',
  navyCard: '#1E2F42',
  gold: '#F59E0B',
  goldLight: '#FCD34D',
  goldDark: '#D97706',
  white: '#FFFFFF',
  offWhite: '#F1F5F9',
  muted: '#94A3B8',
  mutedDark: '#64748B',
  success: '#10B981',
  purple: '#8B5CF6',
  teal: '#0D9488',
  red: '#EF4444',
  orange: '#F97316',
} as const;

// ─── Data ─────────────────────────────────────────────────────────────────────

const CENTERS = [
  {
    id: 1,
    name: "St. John's Ambulance Association of India",
    address: "Pan India (National Body)",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    date_of_listing: "Legacy",

    phone: null,
    rating: 4.1,

    coordinates: {
      lat: 28.6139,
      lng: 77.209,
    },

    status: "closed",
  },

  {
    id: 2,
    name:
      "Multi Disciplinary Centre on Safety, Health & Environment",
    address:
      "IDCO Plot No.4, Chandka Industrial Estate, Infocity Road",
    city: "Bhubaneswar",
    state: "Odisha",
    pincode: "751024",
    date_of_listing: "11.02.1999",

    phone: null,
    rating: 4.5,

    coordinates: {
      lat: 20.342525,
      lng: 85.815096,
    },

    status: "operational",
  },

  {
    id: 3,
    name:
      "Nargundkar Institute of Management (NIM), M/s. Singareni Collieries Company Ltd.",
    address:
      "Beside Singareni High School, 8-incline colony, Godavarikhani",
    city: "Peddapalli",
    state: "Telangana",
    pincode: "505211",
    date_of_listing: "01.09.2021",

    phone: null,
    rating: 3.9,

    coordinates: {
      lat: 18.7726,
      lng: 79.5145,
    },

    status: "closed",
  },

  {
    id: 4,
    name:
      "Mines Rescue Station (MRS), M/s. Central Coalfields Ltd",
    address: "AT+PO+P.S.- Ramgarh, District Ramgarh",
    city: "Ramgarh",
    state: "Jharkhand",
    pincode: "829122",
    date_of_listing: "26.10.2021",

    phone: null,
    rating: 4.4,

    coordinates: {
      lat: 23.6447287,
      lng: 85.5099509,
    },

    status: "operational",
  },

  {
    id: 5,
    name:
      "GVTC, Hutti Gold Mine, M/s. The Hutti Gold Mine Company Ltd.",
    address: "Post: Hutti, Dist: Raichur",
    city: "Hutti",
    state: "Karnataka",
    pincode: "584115",
    date_of_listing: "18.11.2021",

    phone: null,
    rating: 3.8,

    coordinates: {
      lat: 16.1833,
      lng: 76.6333,
    },

    status: "closed",
  },

  {
    id: 6,
    name:
      "Mines Rescue Station (MRS), M/s. Western Coalfield Ltd.",
    address:
      "Indora Complex, Near Power Grid Square, P.O.: Uppalwadi",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440026",
    date_of_listing: "18.11.2021",

    phone: null,
    rating: 4.6,

    coordinates: {
      lat: 21.191864,
      lng: 79.106677,
    },

    status: "operational",
  },

  {
    id: 7,
    name: "AKS University",
    address: "Sherganj, Panna Road",
    city: "Satna",
    state: "Madhya Pradesh",
    pincode: "485001",
    date_of_listing: "18.11.2021",

    phone: null,
    rating: 4.0,

    coordinates: {
      lat: 24.5854,
      lng: 80.8322,
    },

    status: "closed",
  },

  {
    id: 8,
    name: "Challengers Academy of S.H.E",
    address: "N-4/238, IRC Village",
    city: "Bhubaneswar",
    state: "Odisha",
    pincode: "751015",
    date_of_listing: "07.12.2021",

    phone: null,
    rating: 4.3,

    coordinates: {
      lat: 20.227757,
      lng: 85.670155,
    },

    status: "operational",
  },

  {
    id: 9,
    name: "Lifeline Foundation",
    address: "E-501, Kalpavruksh, Gotri Road",
    city: "Vadodara",
    state: "Gujarat",
    pincode: "390021",
    date_of_listing: "10.12.2021",

    phone: null,
    rating: 4.7,

    coordinates: {
      lat: 22.31431,
      lng: 73.146551,
    },

    status: "operational",
  },

  {
    id: 10,
    name: "Abhishek Technical Tutorial Centre",
    address: "J.C. Mallick Road, Hirapur",
    city: "Dhanbad",
    state: "Jharkhand",
    pincode: "826001",
    date_of_listing: "13.12.2021",

    phone: "tel:+919876543210",
    rating: 4.9,

    coordinates: {
      lat: 23.802959,
      lng: 86.444705,
    },

    status: "operational",
  },

    {
    id: 11,
    name:
      "Mines Rescue Station (MRS), Sitarampur, M/s. Eastern Coalfield Ltd.",
    address:
      "P.O.-Sitarampur, District Paschim Bardhaman",
    city: "Sitarampur",
    state: "West Bengal",
    pincode: "713359",
    date_of_listing: "18.01.2022",

    phone: null,
    rating: 4.2,

    coordinates: {
      lat: 23.7074,
      lng: 86.909406,
    },

    status: "operational",
  },

  {
    id: 12,
    name:
      "Health & Family Welfare Foundation",
    address:
      "Bhagwati Colony, P.O.- Chas, Dist- Bokaro",
    city: "Bokaro",
    state: "Jharkhand",
    pincode: "827013",
    date_of_listing: "25.01.2022",

    phone: null,
    rating: 4.4,

    coordinates: {
      lat: 23.63078,
      lng: 86.180368,
    },

    status: "operational",
  },

  {
    id: 13,
    name:
      "Ashritha Mines & Minerals Association First Aid Training Institute",
    address:
      "Medchal-Malkajigiri District",
    city: "Medchal",
    state: "Telangana",
    pincode: "501401",
    date_of_listing: "28.01.2022",

    phone: null,
    rating: 3.8,

    coordinates: {
      lat: 17.493917,
      lng: 78.597636,
    },

    status: "operational",
  },

  {
    id: 14,
    name:
      "Institute of First Aid & Paramedical Science Federation",
    address:
      "No.88, Gurukunj Nagar, Near Shiv Ganesh Hanuman Mandir, Manewada, Besa Road",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440034",
    date_of_listing: "14.02.2022",

    phone: null,
    rating: 4.6,

    coordinates: {
      lat: 21.101425,
      lng: 79.106316,
    },

    status: "operational",
  },

  {
    id: 15,
    name:
      "Group Vocational Training Centre, Rajpura Dariba Complex, Hindustan Zinc Ltd.",
    address:
      "Dariba, Rajsamand",
    city: "Rajsamand",
    state: "Rajasthan",
    pincode: "313211",
    date_of_listing: "25.02.2022",

    phone: null,
    rating: 4.1,

    coordinates: {
      lat: 24.954601,
      lng: 74.128755,
    },

    status: "operational",
  },

  {
    id: 16,
    name: "Shri Arvind Foundation",
    address:
      "NH-33, Gram+Post: Ajanaura, District: Nalanda",
    city: "Nalanda",
    state: "Bihar",
    pincode: "803114",
    date_of_listing: "25.02.2022",

    phone: null,
    rating: 3.9,

    coordinates: {
      lat: 25.1376,
      lng: 85.444,
    },

    status: "closed",
  },

  {
    id: 17,
    name:
      "Dr. Dhaimodker-IMA-First Aid Training Academy",
    address:
      "IMA House, Kurtarkar Commercial Arcade, Phase-II, Kaziwada, Ponda",
    city: "Ponda",
    state: "Goa",
    pincode: "403401",
    date_of_listing: "30.03.2022",

    phone: null,
    rating: 4.0,

    coordinates: {
      lat: 15.4043,
      lng: 74.0143,
    },

    status: "permanently_closed",
  },

  {
    id: 18,
    name:
      "RRRT (Rescue Room), Rampura Agucha Lead Zinc Underground Mine, Hindustan Zinc Ltd.",
    address:
      "Agucha, Dist-Bhilwara",
    city: "Bhilwara",
    state: "Rajasthan",
    pincode: "311022",
    date_of_listing: "30.03.2022",

    phone: null,
    rating: 4.3,

    coordinates: {
      lat: 25.35,
      lng: 74.63,
    },

    status: "closed",
  },

  {
    id: 19,
    name:
      "Mine Vocational Centre, Moher & Moher Amlohri Ext. OCP, M/s Sasan Power Limited",
    address:
      "Singrauli",
    city: "Singrauli",
    state: "Madhya Pradesh",
    pincode: "486886",
    date_of_listing: "18.04.2022",

    phone: null,
    rating: 4.5,

    coordinates: {
      lat: 24.1997,
      lng: 82.6692,
    },

    status: "closed",
  },

  {
    id: 20,
    name:
      "Industrial Medical Centre at NLC India General Hospital of M/s. NLC India Limited",
    address:
      "Neyveli",
    city: "Neyveli",
    state: "Tamil Nadu",
    pincode: "607803",
    date_of_listing: "18.04.2022",

    phone: null,
    rating: 4.1,

    coordinates: {
      lat: 11.607,
      lng: 79.4917,
    },

    status: "closed",
  },
    {
    id: 21,
    name:
      "NMDC Limited - MEAI BH Chapter First Aid Training Centre",
    address:
      "Donimalai Township, Sandur Taluk, Ballari Dist.",
    city: "Ballari",
    state: "Karnataka",
    pincode: "583118",
    date_of_listing: "28.04.2022",

    phone: null,
    rating: 4.2,

    coordinates: {
      lat: 15.2833,
      lng: 76.55,
    },

    status: "closed",
  },

  {
    id: 22,
    name:
      "Mining Solution First Aid Training Centre",
    address:
      "213, EDGE, Vidhan Sabha Road, Mowa",
    city: "Raipur",
    state: "Chhattisgarh",
    pincode: "492001",
    date_of_listing: "02.05.2022",

    phone: null,
    rating: 4.6,

    coordinates: {
      lat: 21.2514,
      lng: 81.6296,
    },

    status: "closed",
  },

  {
    id: 23,
    name:
      "JIFSA, St. Joseph's International Fire & Safety Academy",
    address:
      "Practical Training Ground, Kuchina, Gevra, Dist-Korba",
    city: "Korba",
    state: "Chhattisgarh",
    pincode: "495454",
    date_of_listing: "02.05.2022",

    phone: null,
    rating: 4.4,

    coordinates: {
      lat: 22.3595,
      lng: 82.7501,
    },

    status: "closed",
  },

  {
    id: 24,
    name:
      "Apoorva Mines & Minerals First Aid Training Centre",
    address:
      "#19/1, 2nd Floor, 1st Main Road, 14th Cross, Near Vyalikaval",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560003",
    date_of_listing: "05.05.2022",

    phone: null,
    rating: 4.8,

    coordinates: {
      lat: 13.004649,
      lng: 77.579077,
    },

    status: "operational",
  },

  {
    id: 25,
    name:
      "First Aid Training Centre, Central Excavation Training Institute (CETI), Northern Coalfields Ltd",
    address:
      "Singrauli",
    city: "Singrauli",
    state: "Madhya Pradesh",
    pincode: "486889",
    date_of_listing: "10.05.2022",

    phone: null,
    rating: 4.0,

    coordinates: {
      lat: 24.2,
      lng: 82.68,
    },

    status: "closed",
  },

  {
    id: 26,
    name:
      "Mines Rescue Station Manendragarh, South Eastern Coalfields Ltd",
    address:
      "CHM Road, Amakherwa, Manendragarh, Dist- Koriya",
    city: "Manendragarh",
    state: "Chhattisgarh",
    pincode: "497442",
    date_of_listing: "11.05.2022",

    phone: null,
    rating: 3.9,

    coordinates: {
      lat: 23.2082,
      lng: 82.2175,
    },

    status: "closed",
  },

  {
    id: 27,
    name:
      "First-aid Training Centre, MSAK, Zone-3",
    address:
      "J.C. Pura, Chikkanayanahalli Taluk, Tumkur District",
    city: "Tumkur",
    state: "Karnataka",
    pincode: "572214",
    date_of_listing: "17.05.2022",

    phone: null,
    rating: 4.3,

    coordinates: {
      lat: 13.3379,
      lng: 76.9238,
    },

    status: "closed",
  },

  {
    id: 28,
    name:
      "Vijayanagar Institute of Occupational Health and Industrial Safety (VIOHIS)",
    address:
      "13/14, 80ft Road, Maruthi Nagar, Chandra layout, Vijayanagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560040",
    date_of_listing: "20.07.2022",

    phone: null,
    rating: 4.7,

    coordinates: {
      lat: 12.959254,
      lng: 77.524765,
    },

    status: "operational",
  },

  {
    id: 29,
    name:
      "Mines Rescue Station Orient Area, Mahanadi Coalfields Limited",
    address:
      "Brajrajnagar, Dist-Jharsuguda",
    city: "Jharsuguda",
    state: "Odisha",
    pincode: "768216",
    date_of_listing: "05.08.2022",

    phone: null,
    rating: 4.1,

    coordinates: {
      lat: 21.8167,
      lng: 83.9167,
    },

    status: "closed",
  },

  {
    id: 30,
    name:
      "Pijush First-Aid Training Institute",
    address:
      "Durga Mandir Road, Opposite to Madan Smriti Bhawan",
    city: "Dhanbad",
    state: "Jharkhand",
    pincode: "826001",
    date_of_listing: "23.08.2022",

    phone: null,
    rating: 4.5,

    coordinates: {
      lat: 23.801413,
      lng: 86.444173,
    },

    status: "operational",
  },
    {
    id: 31,
    name:
      "Group Vocational Training Centre, Zawar Group of Mines, M/s. Hindustan Zinc Limited",
    address:
      "P.O.- Zawar Mines, Udaipur",
    city: "Udaipur",
    state: "Rajasthan",
    pincode: "313901",
    date_of_listing: "01.09.2022",

    phone: null,
    rating: 4.2,

    coordinates: {
      lat: 24.5854,
      lng: 73.6859,
    },

    status: "closed",
  },

  {
    id: 32,
    name:
      "National Institute for Allied Medical Sciences",
    address:
      "At-Dola Gobinda Bhawan, Plot No. 2007, Near Mancheswar Railway Station, Rangamatia",
    city: "Bhubaneswar",
    state: "Odisha",
    pincode: "751017",
    date_of_listing: "01.09.2022",

    phone: null,
    rating: 3.8,

    coordinates: {
      lat: 20.2785,
      lng: 85.8683,
    },

    status: "closed",
  },

  {
    id: 33,
    name:
      "Southern Institute of Mines, Health and Industrial Safety",
    address:
      "Plot No. 201, Karthik Paradise, Ritvik Enclave, Vedayapalem PO, SPS Nellore District",
    city: "Nellore",
    state: "Andhra Pradesh",
    pincode: "524004",
    date_of_listing: "05.09.2022",

    phone: null,
    rating: 4.6,

    coordinates: {
      lat: 14.415329,
      lng: 79.96108,
    },

    status: "operational",
  },

  {
    id: 34,
    name:
      "SMIORE First-Aid Training Centre at Group Vocational Training Centre",
    address:
      "Deogiri, Sandur Taluq, Bellary District",
    city: "Bellary",
    state: "Karnataka",
    pincode: "583112",
    date_of_listing: "05.09.2022",

    phone: null,
    rating: 4.0,

    coordinates: {
      lat: 15.1394,
      lng: 76.5549,
    },

    status: "closed",
  },

  {
    id: 35,
    name:
      "AJAX Medical Training at AJAX Medical Research & Referral Pvt. Ltd.",
    address:
      "Ideal Hills Estate, Adarsh Nagar, Gwarighat Road",
    city: "Jabalpur",
    state: "Madhya Pradesh",
    pincode: "482008",
    date_of_listing: "23.09.2022",

    phone: null,
    rating: 4.4,

    coordinates: {
      lat: 23.1815,
      lng: 79.9864,
    },

    status: "closed",
  },

  {
    id: 36,
    name:
      "Sai Nath School of Nursing",
    address:
      "Vill-Harraiya, PO: Pondi Naugai, Dist- Singrauli",
    city: "Singrauli",
    state: "Madhya Pradesh",
    pincode: "486886",
    date_of_listing: "04.10.2022",

    phone: null,
    rating: 3.9,

    coordinates: {
      lat: 24.19,
      lng: 82.66,
    },

    status: "closed",
  },

  {
    id: 37,
    name:
      "Prabhat First-Aid Training Institute",
    address:
      "Chandamore, Raibati Road, PO- Kalipahari, Dist Paschim Bardhman",
    city: "Paschim Bardhaman",
    state: "West Bengal",
    pincode: "713339",
    date_of_listing: "18.10.2022",

    phone: null,
    rating: 4.7,

    coordinates: {
      lat: 23.664204,
      lng: 87.044434,
    },

    status: "operational",
  },

  {
    id: 38,
    name:
      "Mining Engineers' Association of India",
    address:
      "F-608 & 609, VI Floor, Raghava Ratna Towers, 'A' Block, Chirag Ali Lane, Abids",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    date_of_listing: "23.02.2023",

    phone: null,
    rating: 4.8,

    coordinates: {
      lat: 17.393175,
      lng: 78.472837,
    },

    status: "operational",
  },

  {
    id: 39,
    name:
      "GEMS Allied Health Institute (Vijayasree Sankshema Sangam)",
    address:
      "Almighty Nursing Home (Kola Hospitals), Bhavanipuram, Hyderabad Road",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    pincode: "520012",
    date_of_listing: "23.02.2023",

    phone: null,
    rating: 4.1,

    coordinates: {
      lat: 16.5062,
      lng: 80.648,
    },

    status: "closed",
  },

  {
    id: 40,
    name:
      "Central Excavation Training Institute, South Eastern Coalfields Ltd",
    address:
      "Gevra Area, AT+PO Gevra Project, District -Korba",
    city: "Korba",
    state: "Chhattisgarh",
    pincode: "495452",
    date_of_listing: "23.02.2023",

    phone: null,
    rating: 4.3,

    coordinates: {
      lat: 22.339,
      lng: 82.732,
    },

    status: "closed",
  },
    {
    id: 41,
    name:
      "Mine Rescue Station Dhansar, M/s. Bharat Coking Coal Ltd.",
    address:
      "AT/PO Dhansar",
    city: "Dhanbad",
    state: "Jharkhand",
    pincode: "828106",
    date_of_listing: "24.02.2023",

    phone: null,
    rating: 4.5,

    coordinates: {
      lat: 23.85,
      lng: 86.48,
    },

    status: "closed",
  },

  {
    id: 42,
    name:
      "Group Vocational Training Centre (GVTC)",
    address:
      "13A, Parvati Nagar Extension, Janpath, Shyam Nagar",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302019",
    date_of_listing: "24.02.2023",

    phone: null,
    rating: 4.0,

    coordinates: {
      lat: 26.9124,
      lng: 75.7873,
    },

    status: "closed",
  },

  {
    id: 43,
    name:
      "Stablization Centre, Sikri Site Office of Pakri Barwadih Coal Mining Project, M/s. NTPC Ltd.",
    address:
      "PO-Barkagaon, Dist- Hazaribag",
    city: "Hazaribag",
    state: "Jharkhand",
    pincode: "825311",
    date_of_listing: "24.03.2023",

    phone: null,
    rating: 3.9,

    coordinates: {
      lat: 23.9925,
      lng: 85.3637,
    },

    status: "closed",
  },

  {
    id: 44,
    name:
      "Kyra First Aid Training Institute",
    address:
      "21-130/12, Gollapudi, Vijayawada Rural, NTR District",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    pincode: "520012",
    date_of_listing: "05.06.2023",

    phone: null,
    rating: 4.2,

    coordinates: {
      lat: 16.55,
      lng: 80.62,
    },

    status: "closed",
  },

  {
    id: 45,
    name:
      "Bright Star First Aid Training Centre",
    address:
      "S.R. Homecity, Building No. 25, Parasia Road, POAMA, Dist - Chindwara",
    city: "Chhindwara",
    state: "Madhya Pradesh",
    pincode: "480001",
    date_of_listing: "16.08.2023",

    phone: null,
    rating: 4.4,

    coordinates: {
      lat: 22.0574,
      lng: 78.9382,
    },

    status: "closed",
  },

  {
    id: 46,
    name:
      "Ecomen Laboratories Pvt. Ltd.",
    address:
      "First Floor, Sy. No. 91A, Ward No. 7, MCHS Layout, Jakkur",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560064",
    date_of_listing: "19.10.2023",

    phone: null,
    rating: 4.1,

    coordinates: {
      lat: 13.0827,
      lng: 77.5877,
    },

    status: "closed",
  },

  {
    id: 47,
    name:
      "Occupational Health Service",
    address:
      "504, Link Samsara, Opp. Vishnudhara Garden Homes, 100 ft RCC Road, Gota",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "382481",
    date_of_listing: "08.01.2024",

    phone: null,
    rating: 4.6,

    coordinates: {
      lat: 23.1126,
      lng: 72.5277,
    },

    status: "closed",
  },

  {
    id: 48,
    name:
      "National Institute of First Aid & Industrial Safety",
    address:
      "Department of Mining & Mine Surveying, Government Polytechnic, Near Mangalwari Bazar, Sadar",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440001",
    date_of_listing: "02.02.2024",

    phone: null,
    rating: 4.3,

    coordinates: {
      lat: 21.1458,
      lng: 79.0882,
    },

    status: "closed",
  },

  {
    id: 49,
    name:
      "OIL First Aid Training Centre, Group Vocational Training Centre, Oil India Limited",
    address:
      "HR Learning Department, Duliajan, Dibrugarh",
    city: "Duliajan",
    state: "Assam",
    pincode: "786602",
    date_of_listing: "15.02.2024",

    phone: null,
    rating: 4.7,

    coordinates: {
      lat: 27.3667,
      lng: 95.3167,
    },

    status: "closed",
  },

  {
    id: 50,
    name:
      "Dr. Dhaimodker-GGVTC-First Aid Training Academy",
    address:
      "Supriya Apartment 3rd Floor, Haveli, Curti, Ponda",
    city: "Ponda",
    state: "Goa",
    pincode: "403401",
    date_of_listing: "11.03.2024",

    phone: null,
    rating: 4.0,

    coordinates: {
      lat: 15.4043,
      lng: 74.0143,
    },

    status: "closed",
  },

  {
    id: 51,
    name:
      "Ashok Kumar Verma First Aid Training Institute",
    address:
      "Ground Floor, Bhagmati Tower, Near Carmel School, Polytechnic Road, Bekar Bandh",
    city: "Dhanbad",
    state: "Jharkhand",
    pincode: "828130",
    date_of_listing: "26.03.2024",

    phone: null,
    rating: 4.9,

    coordinates: {
      lat: 23.803654,
      lng: 86.424212,
    },

    status: "operational",
  },

  {
    id: 52,
    name:
      "Khurana Educational and Welfare Society",
    address:
      "780/12, Loniya Karbal",
    city: "Chhindwara",
    state: "Madhya Pradesh",
    pincode: "480001",
    date_of_listing: "20.05.2024",

    phone: null,
    rating: 3.8,

    coordinates: {
      lat: 22.0574,
      lng: 78.9382,
    },

    status: "closed",
  },

  {
    id: 53,
    name:
      "Vocational Training Centre, Khetri Copper Complex, M/s. Hindustan Copper Limited",
    address:
      "Khetri Nagar, Jhunjhunu",
    city: "Jhunjhunu",
    state: "Rajasthan",
    pincode: "333504",
    date_of_listing: "22.07.2024",

    phone: null,
    rating: 4.2,

    coordinates: {
      lat: 28.0169,
      lng: 75.792,
    },

    status: "closed",
  },

  {
    id: 54,
    name:
      "Geo Exploration and Mining Solutions",
    address:
      "No. 17, Adhvaitha Ashram Road, Fairlands",
    city: "Salem",
    state: "Tamil Nadu",
    pincode: "636004",
    date_of_listing: "12.08.2024",

    phone: null,
    rating: 4.4,

    coordinates: {
      lat: 11.6643,
      lng: 78.146,
    },

    status: "closed",
  },
];

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  operational: { label: 'Operational', color: COLORS.success, icon: CheckCircle },
  closed: { label: 'Temporarily Closed', color: COLORS.orange, icon: AlertCircle },
  permanently_closed: { label: 'Permanently Closed', color: COLORS.red, icon: XCircle },
};

// ─── Dark Map Style ───────────────────────────────────────────────────────────
export const DARK_MAP_STYLE = [
  { elementType: 'geometry',                                                 stylers: [{ color: '#0F1923' }] },
  { elementType: 'labels.text.stroke',                                       stylers: [{ color: '#0F1923' }] },
  { elementType: 'labels.text.fill',                                         stylers: [{ color: '#94A3B8' }] },
  { featureType: 'road',                    elementType: 'geometry',         stylers: [{ color: '#1A2B3C' }] },
  { featureType: 'road.highway',            elementType: 'geometry',         stylers: [{ color: '#243447' }] },
  { featureType: 'water',                   elementType: 'geometry',         stylers: [{ color: '#0B1622' }] },
  { featureType: 'poi',                                                      stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative',          elementType: 'geometry.stroke',  stylers: [{ color: '#243447' }] },
  { featureType: 'administrative.country',  elementType: 'labels.text.fill', stylers: [{ color: '#F59E0B' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#64748B' }] },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.closed;
  const IconComponent = cfg.icon;
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: `${cfg.color}18`, borderColor: `${cfg.color}40` }]}>
      <IconComponent size={10} color={cfg.color} />
      <Text style={[badgeStyles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start',
  },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});

// ─── Center Detail Bottom Sheet ───────────────────────────────────────────────
const CenterDetailSheet = ({
  center, visible, onClose,
}: {
  center: typeof CENTERS[0] | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 12 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!center) return null;

  const openMaps = () => {
    const { lat, lng } = center.coordinates;
    const url = Platform.OS === 'ios'
      ? `maps:0,0?q=${lat},${lng}`
      : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(center.name)})`;
    Linking.openURL(url);
  };

  const openDialer = () => {
    if (center.phone) {
      Linking.openURL(center.phone);  // tel: prefix se dialer seedha khulega
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={sheetStyles.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[sheetStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={sheetStyles.handle} />
        <View style={sheetStyles.header}>
          <View style={sheetStyles.iconBox}>
            <HeartPulse size={22} color={COLORS.red} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={sheetStyles.name} numberOfLines={2}>{center.name}</Text>
            <Text style={sheetStyles.cityState}>{center.city}, {center.state}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={sheetStyles.closeBtn}>
            <X size={18} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        <StatusBadge status={center.status} />
        <View style={sheetStyles.divider} />

        <View style={sheetStyles.infoRow}>
          <MapPin size={14} color={COLORS.gold} />
          <Text style={sheetStyles.infoText}>
            {center.address}, {center.city}, {center.state} - {center.pincode}
          </Text>
        </View>
        <View style={sheetStyles.infoRow}>
          <Text style={sheetStyles.infoLabel}>Listed on: </Text>
          <Text style={sheetStyles.infoText}>{center.date_of_listing}</Text>
        </View>

        <View style={sheetStyles.actions}>
          <TouchableOpacity style={sheetStyles.actionBtn} onPress={openMaps}>
            <Navigation size={16} color={COLORS.navy} />
            <Text style={sheetStyles.actionText}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[sheetStyles.actionBtn, sheetStyles.actionBtnOutline,
            !center.phone && { opacity: 0.4 }]}
            onPress={openDialer}
            disabled={!center.phone}
            >
            <Phone size={16} color={COLORS.gold} />
            <Text style={[sheetStyles.actionText, { color: COLORS.gold }]}>{center.phone ? 'Contact' : 'No Number'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const sheetStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.navyCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1, borderColor: COLORS.navyLight,
  },
  handle: { width: 40, height: 4, backgroundColor: COLORS.navyLight, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: `${COLORS.red}18`, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '800', color: COLORS.white, lineHeight: 20 },
  cityState: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.navyLight, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: COLORS.navyLight, marginVertical: 14 },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  infoLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  infoText: { fontSize: 12, color: COLORS.offWhite, flex: 1, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.gold, borderRadius: 14, paddingVertical: 13 },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.gold },
  actionText: { fontSize: 14, fontWeight: '800', color: COLORS.navy },
});

// ─── Map View Component ───────────────────────────────────────────────────────
// ✅ FIX: Single clean component — no orphan code, no duplicate return
const MapViewComponent = ({
  centers,
  onMarkerPress,
}: {
  centers: typeof CENTERS;
  onMarkerPress: (c: typeof CENTERS[0]) => void;
}) => {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 22.5,
        longitude: 82.5,
        latitudeDelta: 25,
        longitudeDelta: 25,
      }}
      customMapStyle={DARK_MAP_STYLE}
    >
      {centers.map((c) => (
        <Marker
          key={c.id}
          coordinate={{ latitude: c.coordinates.lat, longitude: c.coordinates.lng }}
          pinColor={
            c.status === 'operational' ? '#10B981'
              : c.status === 'permanently_closed' ? '#EF4444'
                : '#F97316'
          }
          onPress={() => onMarkerPress(c)}
        >
          <Callout tooltip={false}>
            <View style={calloutStyles.wrap}>
              <Text style={calloutStyles.name} numberOfLines={2}>{c.name}</Text>
              <Text style={calloutStyles.loc}>{c.city}, {c.state}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};

const calloutStyles = StyleSheet.create({
  wrap: { backgroundColor: '#1E2F42', padding: 10, borderRadius: 10, maxWidth: 200, borderWidth: 1, borderColor: '#243447' },
  name: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  loc: { fontSize: 11, color: '#94A3B8' },
});

// ─── Center Card ──────────────────────────────────────────────────────────────
const CenterCard = ({
  item, onPress,
}: {
  item: typeof CENTERS[0];
  onPress: () => void;
}) => {
  const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.closed;
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[cardStyles.accent, { backgroundColor: cfg.color }]} />
      <View style={cardStyles.body}>
        <View style={cardStyles.topRow}>
          <View style={[cardStyles.iconBox, { backgroundColor: `${cfg.color}18` }]}>
            <HeartPulse size={18} color={cfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cardStyles.name} numberOfLines={2}>{item.name}</Text>
            <View style={cardStyles.locRow}>
              <MapPin size={10} color={COLORS.muted} />
              <Text style={cardStyles.loc}>{item.city}, {item.state}</Text>
            </View>
          </View>
          <ChevronRight size={16} color={COLORS.mutedDark} />
        </View>
        
        <View style={cardStyles.bottomRow}>
          <StatusBadge status={item.status} />
          <Text style={cardStyles.date}>Listed: {item.date_of_listing}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: COLORS.navyCard, borderRadius: 16, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.navyLight, overflow: 'hidden' },
  accent: { width: 4 },
  body: { flex: 1, padding: 14, gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '700', color: COLORS.white, lineHeight: 18, flex: 1 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  loc: { fontSize: 11, color: COLORS.muted, fontWeight: '500' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: 10, color: COLORS.mutedDark, fontWeight: '500' },
});

// ─── Stats Summary ────────────────────────────────────────────────────────────
const StatsSummary = ({ data }: { data: typeof CENTERS }) => {
  const operational = data.filter(c => c.status === 'operational').length;
  const closed = data.filter(c => c.status === 'closed').length;
  const permanent = data.filter(c => c.status === 'permanently_closed').length;

  return (
    <View style={summaryStyles.wrap}>
      {[
        { val: operational, lbl: 'Active', color: COLORS.success },
        { val: closed, lbl: 'Closed', color: COLORS.orange },
        { val: permanent, lbl: 'Delisted', color: COLORS.red },
        { val: data.length, lbl: 'Total', color: COLORS.gold },
      ].map((s, i, arr) => (
        <React.Fragment key={s.lbl}>
          <View style={summaryStyles.item}>
            <Text style={[summaryStyles.val, { color: s.color }]}>{s.val}</Text>
            <Text style={summaryStyles.lbl}>{s.lbl}</Text>
          </View>
          {i < arr.length - 1 && <View style={summaryStyles.div} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const summaryStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: COLORS.navyCard, borderRadius: 14, marginHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.navyLight, paddingVertical: 12 },
  item: { flex: 1, alignItems: 'center' },
  val: { fontSize: 20, fontWeight: '800' },
  lbl: { fontSize: 10, color: COLORS.mutedDark, fontWeight: '600', marginTop: 1 },
  div: { width: 1, backgroundColor: COLORS.navyLight, marginVertical: 4 },
});

// ─── Filter Options ───────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'operational', label: 'Active' },
  { key: 'closed', label: 'Closed' },
  { key: 'permanently_closed', label: 'Delisted' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FirstAidCenter() {
  const navigation = useNavigation<FirstAidNavProp>();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState<typeof CENTERS[0] | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const filtered = useMemo(() => {
    return CENTERS.filter(c => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.state.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const openDetail = (center: typeof CENTERS[0]) => {
    setSelectedCenter(center);
    setSheetVisible(true);
  };

  return (
    <View style={screenStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Header */}
      <View style={screenStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={screenStyles.backBtn}>
          <X size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={screenStyles.headerCenter}>
          <HeartPulse size={18} color={COLORS.red} />
          <Text style={screenStyles.headerTitle}>First Aid Traning Centers</Text>
        </View>
      </View>

      {/* Search */}
      <View style={screenStyles.searchWrap}>
        <Search size={16} color={COLORS.muted} />
        <TextInput
          style={screenStyles.searchInput}
          placeholder="Search by name, city, state..."
          placeholderTextColor={COLORS.mutedDark}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={14} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
     <View style={screenStyles.filterRow}>
        {FILTER_OPTIONS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[screenStyles.filterChip, statusFilter === f.key && screenStyles.filterChipActive]}
            onPress={() => setStatusFilter(f.key)}
          >
            <Text style={[screenStyles.filterChipText, statusFilter === f.key && screenStyles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      {/* <StatsSummary data={filtered} /> */}

      {/* Content */}
      {viewMode === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <CenterCard item={item} onPress={() => openDetail(item)} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={screenStyles.empty}>
              <Text style={screenStyles.emptyIcon}>🔍</Text>
              <Text style={screenStyles.emptyText}>No centers found</Text>
            </View>
          }
        />
      ) : (
        <MapViewComponent centers={filtered} onMarkerPress={openDetail} />
      )}

      {/* Bottom Sheet */}
      <CenterDetailSheet
        center={selectedCenter}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

/// ─── Screen Styles ────────────────────────────────────────────────────────────
const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 14 : 12,
    paddingBottom: 14,

    gap: 12,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,

    backgroundColor: COLORS.navyLight,

    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },

  toggleWrap: {
    flexDirection: 'row',

    backgroundColor: COLORS.navyLight,
    borderRadius: 10,

    padding: 3,
  },

  toggleBtn: {
    width: 32,
    height: 28,
    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleActive: {
    backgroundColor: COLORS.gold,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,

    marginHorizontal: 16,
    marginBottom: 12,

    backgroundColor: COLORS.navyCard,
    borderRadius: 14,

    borderWidth: 1,
    borderColor: COLORS.navyLight,

    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  searchInput: {
    flex: 1,

    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,

    padding: 0,
  },

  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
    flexDirection: 'row', 
  },

  filterChip: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 16,
    paddingVertical: 0,
    backgroundColor: COLORS.navyLight,
    borderWidth: 1,
    borderColor: COLORS.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterChipActive: {
    backgroundColor: `${COLORS.gold}20`,
    borderColor: `${COLORS.gold}60`,
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedDark,
  },

  filterChipTextActive: {
    color: COLORS.gold,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.muted,
  },
});