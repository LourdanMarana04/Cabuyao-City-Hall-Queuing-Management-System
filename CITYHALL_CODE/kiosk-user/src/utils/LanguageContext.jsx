import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    welcome: 'Welcome',
    selectDepartment: 'Select Department',
    selectTransaction: 'Select Transaction',
    proceedToQueue: 'Proceed to Queue',
    generatingQueue: 'Generating Queue Number...',
    back: 'Back',
    start: 'Start',
    priority: 'Priority',
    regular: 'Regular',
    loadingDepartments: 'Loading departments...',
    noTransactions: 'No transactions available.',
    loadingTransactionDetails: 'Loading transaction details...',
    transactionNotFound: 'Transaction not found.',
    transactionDetails: 'Transaction Details',
    checklistRequirements: 'Checklist Requirements',
    requirement: 'Requirement',
    whereToSecure: 'Where to Secure',
    noRequirements: 'No requirements listed.',
    procedures: 'Procedures',
    procedure: 'Procedure',
    noProcedures: 'No procedures listed.',
    yourQueueNumber: 'Your Queue Number',
    department: 'Department',
    transaction: 'Transaction',
    estimatedWaitTime: 'Estimated Wait Time',
    printQueueSlip: 'Print Queue Slip',
    backToStart: 'Back to Start',
    generatedOn: 'Generated on',
    date: 'Date',
    time: 'Time',
    pleaseWaitForNumber: 'Please wait for your number to be called',
    keepThisSlip: 'Keep this slip for reference',
    // Add more keys as needed
  },
  tl: {
    welcome: 'Maligayang Pagdating',
    selectDepartment: 'Pumili ng Departamento',
    selectTransaction: 'Pumili ng Transaksyon',
    proceedToQueue: 'Magpatuloy sa Pagkuha ng Numero',
    generatingQueue: 'Gumagawa ng Numero ng Pila...',
    back: 'Bumalik',
    start: 'Simula',
    priority: 'Prayoridad',
    regular: 'Regular',
    loadingDepartments: 'Ikinakarga ang mga departamento...',
    noTransactions: 'Walang magagamit na transaksyon.',
    loadingTransactionDetails: 'Ikinakarga ang detalye ng transaksyon...',
    transactionNotFound: 'Hindi natagpuan ang transaksyon.',
    transactionDetails: 'Detalye ng Transaksyon',
    checklistRequirements: 'Mga Kailangan sa Checklist',
    requirement: 'Kailangan',
    whereToSecure: 'Saan Kukunin',
    noRequirements: 'Walang nakalistang kailangan.',
    procedures: 'Mga Proseso',
    procedure: 'Proseso',
    noProcedures: 'Walang nakalistang proseso.',
    yourQueueNumber: 'Iyong Numero sa Pila',
    department: 'Departamento',
    transaction: 'Transaksyon',
    estimatedWaitTime: 'Tinatayang Oras ng Paghihintay',
    printQueueSlip: 'I-print ang Queue Slip',
    backToStart: 'Bumalik sa Simula',
    generatedOn: 'Nabuo noong',
    date: 'Petsa',
    time: 'Oras',
    pleaseWaitForNumber: 'Mangyaring maghintay na tawagin ang iyong numero',
    keepThisSlip: 'Itago ang slip na ito para sa sanggunian',
    // Add more keys as needed
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 