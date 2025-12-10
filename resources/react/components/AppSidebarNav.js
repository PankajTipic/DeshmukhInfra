// import React from 'react'
// import { NavLink } from 'react-router-dom'
// import PropTypes from 'prop-types'

// import SimpleBar from 'simplebar-react'
// import 'simplebar-react/dist/simplebar.min.css'

// import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

// // Final dark gray scrollbar style
// const scrollbarStyle = `
//   .simplebar-track.simplebar-vertical {
//     opacity: 1 !important;
//     background: transparent !important; /* Transparent track */
//     width: 8px !important;
//   }

//   .simplebar-scrollbar::before {
//     background-color: #fff !important; /* White thumb */
//     border-radius: 4px;
//   }

//   .simplebar-scrollbar {
//     display: block !important;
//   }
// `


// export const AppSidebarNav = ({ items }) => {
//   const navLink = (name, icon, badge, indent = false) => {
//     return (
//       <>
//         {icon
//           ? icon
//           : indent && (
//               <span className="nav-icon">
//                 <span className="nav-icon-bullet"></span>
//               </span>
//             )}
//         {name}
//         {badge && (
//           <CBadge color={badge.color} className="ms-auto">
//             {badge.text}
//           </CBadge>
//         )}
//       </>
//     )
//   }

//   const navItem = (item, index, indent = false) => {
//     const { component, name, badge, icon, ...rest } = item
//     const Component = component
//     return (
//       <Component as="div" key={index}>
//         {rest.to || rest.href ? (
//           <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
//             {navLink(name, icon, badge, indent)}
//           </CNavLink>
//         ) : (
//           navLink(name, icon, badge, indent)
//         )}
//       </Component>
//     )
//   }

//   const navGroup = (item, index) => {
//     const { component, name, icon, items, ...rest } = item
//     const Component = component
//     return (
//       <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
//         {items?.map((child, idx) =>
//           child.items ? navGroup(child, idx) : navItem(child, idx, true),
//         )}
//       </Component>
//     )
//   }

//   return (
//     <>
//       <style>{scrollbarStyle}</style>
//       <CSidebarNav as={SimpleBar} style={{ height: '100%' }}>
//         {items?.map((item, index) =>
//           item.items ? navGroup(item, index) : navItem(item, index),
//         )}
//       </CSidebarNav>
//     </>
//   )
// }

// AppSidebarNav.propTypes = {
//   items: PropTypes.arrayOf(PropTypes.any).isRequired,
// }

import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

// Final dark gray scrollbar style
const scrollbarStyle = `
  .simplebar-track.simplebar-vertical {
    opacity: 1 !important;
    background: transparent !important; /* Transparent track */
    width: 8px !important;
  }

  .simplebar-scrollbar::before {
    background-color: #fff !important; /* White thumb */
    border-radius: 4px;
  }

  .simplebar-scrollbar {
    display: block !important;
  }

  /* Put this in your scrollbarStyle string or a CSS file */
.custom-active {
  background-color: #00e5ff !important;
  color: #000 !important;
  font-weight: 600;
  display: block;              /* makes it span full width */
  width: 100%;                 /* fills the row */
  border-radius: 4px;          /* optional for rounded look */
}

`

export const AppSidebarNav = ({ items }) => {
  const [activeItem, setActiveItem] = useState(null)

  const navLink = (name, icon, badge, isActive, indent = false) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}
      <span>{name}</span>

        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, to, href, ...rest } = item
    const Component = component
    const isActive = activeItem === name

    return (
      <Component as="div" key={index}>
        {to || href ? (
          <CNavLink
  as={to ? NavLink : 'a'}
  to={to}
  href={href}
  onClick={() => setActiveItem(name)}
  className={isActive ? 'custom-active' : ''}
  {...rest}
>
  {navLink(name, icon, badge, isActive, indent)}
</CNavLink>

        ) : (
          navLink(name, icon, badge, isActive, indent)
        )}
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { component, name, icon, items, ...rest } = item
    const Component = component
    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon, false, false)} {...rest}>
        {items?.map((child, idx) =>
          child.items ? navGroup(child, idx) : navItem(child, idx, true),
        )}
      </Component>
    )
  }

  return (
    <>
      <style>{scrollbarStyle}</style>
      <CSidebarNav as={SimpleBar} style={{ height: '100%' }}>
        {items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index),
        )}
      </CSidebarNav>
    </>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
