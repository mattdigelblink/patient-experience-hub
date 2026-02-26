'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconButton, Box, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Badge from '@mui/material/Badge';
import { HamburgerMenu } from './HamburgerMenu';

// Import RxOSLogo from ui-tools
const RxOSLogo = () => (
  <div style={{ width: '56px' }}>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      version='1.1'
      viewBox='0 0 230.1 107.4'
    >
      <defs>
        <style>
          {`
            .st0 {
              fill: #dc384d;
            }
            .st1 {
              fill: #333;
            }
          `}
        </style>
      </defs>
      <path
        className='st1'
        d='M84.6,107.4l-18.3-26.7,16.3-23.7h-18.4l-7.1,10.3-13.8-20.1c8.5-3.8,13.6-11.8,13.6-21.5C57,10.3,45.9.4,29.6.4H0v76.3h16.3v-25.6h11.2l20.4,29.6-18.3,26.6h18.2l9.2-13.4,9.2,13.4h18.2ZM27.6,37.5h-11.2V14h11.2c7.7,0,12.8,4.6,12.8,11.8s-5,11.7-12.8,11.7Z'
      />
      <path
        className='st0'
        d='M87,38.8C87,16.6,102.2,0,124.8,0s37.8,16.6,37.8,38.8-15.4,38.8-37.8,38.8-37.8-16.6-37.8-38.8ZM145.8,38.8c0-15.2-8.3-25-21-25s-21.1,9.8-21.1,25,8.3,25,21.1,25,21-9.8,21-25Z'
      />
      <path
        className='st0'
        d='M168.7,51.9h16c.5,7.6,6.4,12.8,15.6,12.8s13.3-3.1,13.3-9.2-6-7.8-16.3-9.8c-15.4-3.1-26.8-7.2-26.8-22.5S181.7,0,198.9,0s29.4,9.4,29.6,24h-16c-.8-6.4-5.4-11-14-11s-11.7,2.7-11.7,8.7,6,7.6,16.2,9.6c15.5,2.9,26.9,7.2,26.9,22.3s-11.9,24-29.8,24-31.5-10.2-31.6-25.7Z'
      />
    </svg>
  </div>
);

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('rxdemo_auth');
    router.push('/login');
    handleUserMenuClose();
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: '52px', // Height of prototype banner
          left: 0,
          right: 0,
          height: '64px',
          bgcolor: 'white',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 40,
        }}
      >
        <Box
          sx={{
            height: '100%',
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left side - Hamburger and Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              sx={{ color: '#475569' }}
            >
              <MenuIcon />
            </IconButton>

            {/* RxOS Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <RxOSLogo />
            </Link>
          </Box>

          {/* Right side - Icon buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton aria-label="Settings" sx={{ color: '#475569' }}>
              <SettingsIcon />
            </IconButton>

            <IconButton aria-label="Help" sx={{ color: '#475569' }}>
              <HelpOutlineIcon />
            </IconButton>

            <IconButton aria-label="Notifications" sx={{ color: '#475569' }}>
              <Badge
                variant="dot"
                sx={{
                  '& .MuiBadge-dot': {
                    backgroundColor: '#dc384d',
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              aria-label="User profile"
              sx={{ color: '#475569' }}
              onClick={handleUserMenuOpen}
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>

      {/* Hamburger Menu Drawer */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
