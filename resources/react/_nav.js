import React from 'react';
import CIcon from '@coreui/icons-react';
import { cibElasticStack, cilCash, cilChart, cilClipboard, cilColorBorder, cilDescription, cilDollar, cilGroup, cilLayers, cilListRich, cilUser } from '@coreui/icons';
import { CNavGroup, CNavItem } from '@coreui/react';
import { getUserData } from './util/session';

export default function fetchNavItems(t1) {
  const userData = getUserData();
  const user = userData?.type;
  const t = t1;

  let _nav = [];

  // Super Admin (user === 0) - No plan restrictions (unchanged)
  if (user === 0) {
    _nav = [
      {
        component: CNavItem,
        name: t("LABELS.Tipicdashboard"),
        to: '/superDashboard',
        icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
      },
      {
        component: CNavGroup,
        name: t("LABELS.company"),
        icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.new_company"),
            to: '/company/new',
          },
          {
            component: CNavItem,
            name: t("LABELS.all_companies"),
            to: '/company/all',
          },
          {
            component: CNavItem,
            name: 'Company Subscription',
            to: '/company/companyReceipt',
          },
        ],
      },
      {
        component: CNavGroup,
        name: t("LABELS.user_management"),
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.all_Users"),
            to: 'usermanagement/all-users',
          },
        ],
      },
      {
        component: CNavItem,
        name: t("LABELS.plans"),
        to: '/plans',
        icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t("LABELS.OnboardingTypesConfigure"),
        to: '/onboarding-partner-configure',
        icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
      },
      {
        component: CNavGroup,
        name: t("LABELS.onboarding_partners"),
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.new_partner"),
            to: '/onboarding-partner/register',
          },
          {
            component: CNavItem,
            name: t("LABELS.All_partnerss"),
            to: '/onboarding-partner/AllPartners',
          },
        ],
      },
    ];
  }
  
  // Admin (user === 1) - Simple navigation
  else if (user === 1) {
    _nav = [
      {
        component: CNavItem,
        name: t("LABELS.dashboard"),
        to: '/dashboard',
        icon: <CIcon icon={cibElasticStack}  customClassName="nav-icon" />,
        // style: { backgroundColor: 'cyan', color: 'black' },
      },
      {
        component: CNavItem,
        name: 'Work Log',
        to: '/worklog',
        icon: <CIcon icon={cilColorBorder} customClassName="nav-icon" />,
      },
       {
        component: CNavItem,
        name: t("LABELS.new_expense"),
        to: '/expense/new',
        icon: <CIcon icon={cilDollar}  customClassName="nav-icon" />,
        // style: { backgroundColor: 'cyan', color: 'black' },
      },
      {
        component: CNavItem,
        name: 'Work Log Report',
        to: '/infraDetailsShowTable',
        icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
      },

         {
        component: CNavGroup,
        name: "Bills",
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
        items: [

           {
        component: CNavItem,
        name: "Create Invoice",
        to: '/invoice',
        // icon: <CIcon icon={cibElasticStack}  customClassName="nav-icon" />,
        // style: { backgroundColor: 'cyan', color: 'black' },
        className: 'ms-2',
      }, 
       {
        component: CNavItem,
        name: "All Invoices",
        to: '/invoiceTable',
        // icon: <CIcon icon={cibElasticStack}  customClassName="nav-icon" />,
        // style: { backgroundColor: 'cyan', color: 'black' },
        className: 'ms-2',
      },
      {
        component: CNavItem,
        name:"Vendor Budget",
        to: '/budget',
        // icon: <CIcon icon={cilLayers}  customClassName="nav-icon" />,
        // style: { backgroundColor: 'cyan', color: 'black' },
        className: 'ms-2',
      },

      //  {
      //   component: CNavItem,
      //   name:"Purches Vendor",
      //   to: '/vendorPurches',
      //   // icon: <CIcon icon={cilLayers}  customClassName="nav-icon" />,
      //   // style: { backgroundColor: 'cyan', color: 'black' },
      //   className: 'ms-2',
      // },



        ]},
      {
            component: CNavItem,
            name: 'Project Summary Report',
            to: '/ProjectSummeryReport',
            icon: <CIcon icon={cilLayers}  customClassName="nav-icon" />,
            
          },
      // {
      //   component: CNavItem,
      //   name: 'Project Income',
      //   to: '/projectIncome',
      //   icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      // },
      //   {
      //   component: CNavItem,
      //   name: 'All Income',
      //   to: '/incomeTable',
      //   icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavItem,
      //   name: 'All Income',
      //   to: '/incomeTable',
      //   icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      // },


      {
        component: CNavGroup,
        name: "Payments",
        icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
        items: [
 {
        component: CNavItem,
        name: 'Oprator Payment',
        to: '/operatorReport',
        // icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
        className: 'ms-2',
      },
       {
        component: CNavItem,
        name: 'Vendor Payment',
        to: '/vendorReport',
        // icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
        className: 'ms-2',
      },

      // {
      //   component: CNavItem,
      //   name: 'Purches Vendor Payment',
      //   to: '/vendorPurchesPayment',
      //   // icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      //   className: 'ms-2',
      // },
       {
        component: CNavItem,
        name: 'Income Report',
        to: '/incomeTable',
        // icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
        className: 'ms-2',

      },
      {
        component: CNavItem,
        name: 'Internal Money Transfer',
        to: '/internal-money-transfer',
        // icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
        className: 'ms-2',

      },
        ]},


      // {
      //   component: CNavItem,
      //   name: 'Oprator Payment',
      //   to: '/operatorReport',
      //   icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      // },
      //  {
      //   component: CNavItem,
      //   name: 'Vendor Payment',
      //   to: '/vendorReport',
      //   icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      // },

      {
        component: CNavGroup,
        name: t("LABELS.report"),
        icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.reports"),
            to: 'Reports/Reports',
            className: 'ms-2',
          },
          // {
          //   component: CNavItem,
          //   name: t("LABELS.project_report"),
          //   to: 'Reports/Customer_Report',
          //   className: 'ms-2',
          // },
          // {
          //   component: CNavItem,
          //   name: 'Project Summary Report',
          //   to: '/ProjectSummeryReport',
          //   className: 'ms-2',
          // },
          {
            component: CNavItem,
            name: t("LABELS.expense_report"),
            to: '/expense/expenseReport',
            className: 'ms-2',
          },
        ],
      },




       {
        component: CNavGroup,
        name: 'Purchase Vendor ',
        icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
        items: [

{component: CNavItem,
    name: 'Add Purches Vendor',
   to: '/displayPurchesVendors',
className: 'ms-2',
},

          {
            component: CNavItem,
            name: 'New Purchase',
            to: '/vendorPurches',
            className: 'ms-2',
          },

        
          
    {
        component: CNavItem,
        name: ' Make Vendor Payment',
        to: '/vendorPurchesPayment',
        className: 'ms-2',
      },
        ],
      },




     
      {
        component: CNavGroup,
        name: "Manage Software",
        icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
        items: [
          // {
          //   component: CNavItem,
          //   name: t("LABELS.all_customers"),
          //   to: '/customer/all',
          //   className: 'ms-2',
          // },
           {
            component: CNavItem,
            name: t("LABELS.all_customers"),
            to: '/project',
            className: 'ms-2',
          },
          {
            component: CNavItem,
            name: t("LABELS.all_expense_types"),
            to: '/expense/all-type',
            className: 'ms-2',
          },
          // {
          //   component: CNavItem,
          //   name: t("LABELS.all_products"),
          //   to: '/products/all',
          //   className: 'ms-2',
          // },
          {
            component: CNavItem,
            // name: t("LABELS.all_oprator"),
            name: "All Resources",
            to: '/OpratorList',
            className: 'ms-2',
          },
          {
            component: CNavItem,
            // name: t("LABELS.supervisor"),
            name: "All Acountant",
            to: '/supervisor',
            className: 'ms-2',
          },
          {
                component: CNavItem,
                name: "All Raw Materials",
                to: '/showRawMaterials',
                className: 'ms-2',
              },
           {
                component: CNavItem,
                name: "All Machinary",
                to: '/MachineriesTable',
                className: 'ms-2',
              },
        ],

      },

      //   {
      //   component: CNavItem,
      //   name:"Budget",
      //   to: '/budget',
      //   icon: <CIcon icon={cilLayers}  customClassName="nav-icon" />,
      //   // style: { backgroundColor: 'cyan', color: 'black' },
      // },

   

      //  {
      //   component: CNavItem,
      //   name: t("LABELS.invoice"),
      //   to: '/invoice',
      //   icon: <CIcon icon={cibElasticStack}  customClassName="nav-icon" />,
      //   // style: { backgroundColor: 'cyan', color: 'black' },
      // }, 
      //  {
      //   component: CNavItem,
      //   name: "Invoice Table",
      //   to: '/invoiceTable',
      //   icon: <CIcon icon={cibElasticStack}  customClassName="nav-icon" />,
      //   // style: { backgroundColor: 'cyan', color: 'black' },
      // },

    ];
  }
  
  // Manager (user === 2) - Simple navigation
  else if (user === 2) {
    _nav = [
      {
        component: CNavItem,
        name: 'Work Log',
        to: '/worklog',
        icon: <CIcon icon={cilColorBorder} customClassName="nav-icon" />,
      },
       {
        component: CNavItem,
        name: t("LABELS.new_expense"),
        to: '/expense/new',
        icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Work Log Report',
        to: '/infraDetailsShowTable',
        icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
      },
      // {
      //   component: CNavItem,
      //   name: 'Project Income',
      //   to: '/projectIncome',
      //   icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      // },
    
      // {
      //   component: CNavItem,
      //   name: 'All Income',
      //   to: '/incomeTable',
      //   icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      // },
      {
        component: CNavGroup,
        name: t("LABELS.report"),
        icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
        items: [
          // {
          //   component: CNavItem,
          //   name: t("LABELS.project_report"),
          //   to: 'Reports/Customer_Report',
          //   className: 'ms-2',
          // },
          {
            component: CNavItem,
            name: t("LABELS.expense_report"),
            to: '/expense/expenseReport',
            className: 'ms-2',
          },
        ],
      },
     
      {
        component: CNavGroup,
        name: "Manage Software",
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.all_customers"),
            to: '/project',
            className: 'ms-2',
          },
          {
            component: CNavItem,
            name: t("LABELS.all_expense_types"),
            to: '/expense/all-type',
            className: 'ms-2',
          },
          {
            component: CNavItem,
            name: "All Oprators / Supervisors",
            to: '/OpratorList',
            className: 'ms-2',
          },
           {
                component: CNavItem,
                name: "All Raw Materials",
                to: '/showRawMaterials',
                className: 'ms-2',
              },
          {
            component: CNavItem,
            name: "All Machinary",
            to: '/MachineriesTable',
            className: 'ms-2',
          },
        ],
      },
    ];
  }
  
  // Employee/Partner (user === 3) - Fixed missing navigation
  else if (user === 3) {
    _nav = [
      {
        component: CNavItem,
        name: 'Work Log',
        to: '/worklog',
        icon: <CIcon icon={cilColorBorder} customClassName="nav-icon" />,
      },
       {
        component: CNavItem,
        name: t("LABELS.new_expense"),
        to: '/expense/new',
        icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Work Log Report',
        to: '/infraDetailsShowTable',
        icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
      },
      
      {
        component: CNavGroup,
        name: t("LABELS.report"),
        icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
        items: [
          
          {
            component: CNavItem,
            name: t("LABELS.expense_report"),
            to: '/expense/expenseReport',
            className: 'ms-2',
          },
        ],
      },

       {
        component: CNavGroup,
        name: "Bills",
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
        items: [

           {
        component: CNavItem,
        name: "Create Invoice",
        to: '/invoice',
        // icon: <CIcon icon={cibElasticStack}  customClassName="nav-icon" />,
        // style: { backgroundColor: 'cyan', color: 'black' },
        className: 'ms-2',
      }, 
       {
        component: CNavItem,
        name: "All Invoices",
        to: '/invoiceTable',
        // icon: <CIcon icon={cibElasticStack}  customClassName="nav-icon" />,
        // style: { backgroundColor: 'cyan', color: 'black' },
        className: 'ms-2',
      },
      {
        component: CNavItem,
        name:"Vendor Budget",
        to: '/budget',
        // icon: <CIcon icon={cilLayers}  customClassName="nav-icon" />,
        // style: { backgroundColor: 'cyan', color: 'black' },
        className: 'ms-2',
      },

        ]},
     
      {
        component: CNavGroup,
        name: "Manage Software",
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.all_customers"),
            to: '/project',
            className: 'ms-2',
          },
          {
            component: CNavItem,
            name: t("LABELS.all_expense_types"),
            to: '/expense/all-type',
            className: 'ms-2',
          },
          {
            component: CNavItem,
            name: "All Oprators / Supervisors",
            to: '/OpratorList',
            className: 'ms-2',
          },
           {
                component: CNavItem,
                name: "All Raw Materials",
                to: '/showRawMaterials',
                className: 'ms-2',
              },
          {
            component: CNavItem,
            name: "All Machinary",
            to: '/MachineriesTable',
            className: 'ms-2',
          },
        ],
      },
    ];


  }







   // Employee/Partner (user === 3) - Fixed missing navigation
  else if (user === 4) {
    _nav = [

         {
        component: CNavGroup,
        name: 'Purchase Vendor ',
        icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
        items: [

{component: CNavItem,
    name: 'Add Purches Vendor',
   to: '/displayPurchesVendors',
className: 'ms-2',
},

          {
            component: CNavItem,
            name: 'New Purchase',
            to: '/vendorPurches',
            className: 'ms-2',
          },

        
          
    {
        component: CNavItem,
        name: ' Make Vendor Payment',
        to: '/vendorPurchesPayment',
        className: 'ms-2',
      },
        ],
      },
    
    ];

  }




  return _nav;
}