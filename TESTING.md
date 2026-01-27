# Testing Guide

Complete testing guide for both API integrations and page editor.

## Prerequisites

1. Application running locally:
```bash
npm run dev
```

2. Browser open at: http://localhost:3000

## Test Plan Overview

### API Integrations Testing
- [ ] HubSpot OAuth and data fetch
- [ ] Google Ads OAuth and data fetch
- [ ] Shopify OAuth and data fetch
- [ ] LinkedIn Ads OAuth and data fetch
- [ ] Connection status persistence
- [ ] Error handling

### Page Editor Testing
- [ ] Element selection
- [ ] Content editing
- [ ] Style changes
- [ ] Link/button updates
- [ ] Persistence
- [ ] Reset functionality

## API Integration Tests

### Test 1: HubSpot Integration

#### Setup
1. Navigate to http://localhost:3000
2. Click "Manage Integrations"
3. Find HubSpot card

#### Test OAuth Flow
**Steps:**
1. Click "Connect" button
2. OAuth popup should open
3. Login to HubSpot (or use existing session)
4. Authorize the app
5. Popup closes automatically

**Expected Results:**
- ✅ Button changes to "Connected"
- ✅ Green "Connected" badge appears
- ✅ "Fetch Data" button becomes available

**If Failed:**
- Check Nango dashboard for errors
- Verify HubSpot OAuth credentials
- Ensure redirect URL matches

#### Test Data Fetching
**Steps:**
1. Click "Fetch Data" button
2. Wait for loading to complete

**Expected Results:**
- ✅ "Live Data" section appears
- ✅ Shows counts:
  - Total Contacts: X
  - Total Deals: Y
  - Total Companies: Z
- ✅ Numbers are > 0 (if you have data)

**If Failed:**
- Check browser console for errors
- Verify OAuth scopes include read permissions
- Check API route logs

#### Test Connection Persistence
**Steps:**
1. Refresh the page
2. Look at HubSpot card

**Expected Results:**
- ✅ Still shows "Connected" status
- ✅ Can fetch data without re-authentication

### Test 2: Google Ads Integration

#### Test OAuth Flow
**Steps:**
1. Find Google Ads card
2. Click "Connect"
3. Complete OAuth in popup
4. Select ad account

**Expected Results:**
- ✅ Connection successful
- ✅ Status persists

**Common Issues:**
- Account selection required
- Developer token needed
- Manager account setup

#### Test Data Fetching
**Steps:**
1. Click "Fetch Data"

**Expected Results:**
- ✅ Campaign data displays
- ✅ Shows total campaigns
- ✅ Metrics included (if available)

### Test 3: Shopify Integration

#### Test OAuth Flow
**Steps:**
1. Find Shopify card
2. Click "Connect"
3. Enter store URL when prompted
4. Authorize app

**Expected Results:**
- ✅ Store connects successfully
- ✅ App installed on store

**Notes:**
- Requires Shopify store URL
- Must have appropriate plan
- Admin permissions needed

#### Test Data Fetching
**Steps:**
1. Click "Fetch Data"

**Expected Results:**
- ✅ Products list
- ✅ Orders list (if any)
- ✅ Customers list
- ✅ Shows counts for each

### Test 4: LinkedIn Ads Integration

#### Test OAuth Flow
**Steps:**
1. Find LinkedIn Ads card
2. Click "Connect"
3. Login to LinkedIn
4. Authorize app

**Expected Results:**
- ✅ Connection established
- ✅ Ad account access granted

#### Test Data Fetching
**Steps:**
1. Click "Fetch Data"

**Expected Results:**
- ✅ Ad account info displays
- ✅ Campaign data (if available)
- ✅ Total campaigns count

### Test 5: Error Handling

#### Test Invalid Connection
**Steps:**
1. Manually clear connection in Nango dashboard
2. Try to fetch data

**Expected Results:**
- ✅ Error message displays
- ✅ Prompts to reconnect
- ✅ No app crash

#### Test Network Errors
**Steps:**
1. Disconnect internet
2. Try to connect or fetch data

**Expected Results:**
- ✅ Graceful error handling
- ✅ User-friendly message
- ✅ Retry option available

## Page Editor Tests

### Test 6: Element Selection

#### Test Headline Selection
**Steps:**
1. Navigate to http://localhost:3000
2. Click "Open Page Editor"
3. Click "Enable Editor Mode"
4. Click on "Welcome to Our Amazing Product"

**Expected Results:**
- ✅ Element highlights with blue border
- ✅ Sidebar shows element properties
- ✅ Element Type shows "headline"
- ✅ Content textarea filled with text

#### Test Button Selection
**Steps:**
1. Click on "Get Started Now" button

**Expected Results:**
- ✅ Button selected
- ✅ Element Type shows "button"
- ✅ Background color picker appears
- ✅ Link URL field appears

#### Test Multiple Selections
**Steps:**
1. Select headline
2. Select different element
3. Select back to headline

**Expected Results:**
- ✅ Only one element selected at a time
- ✅ Properties update correctly
- ✅ No conflicts or errors

### Test 7: Content Editing

#### Test Headline Edit
**Steps:**
1. Select main headline
2. Change text in content textarea to "New Headline Text"
3. Look at page

**Expected Results:**
- ✅ Headline updates in real-time
- ✅ Change visible immediately
- ✅ Layout doesn't break

#### Test Button Text Edit
**Steps:**
1. Select CTA button
2. Change text to "Click Here Now"

**Expected Results:**
- ✅ Button text updates
- ✅ Button size adjusts
- ✅ Still clickable

#### Test Multi-line Text
**Steps:**
1. Select body text element
2. Add line breaks and longer content

**Expected Results:**
- ✅ Line breaks respected
- ✅ Text wraps correctly
- ✅ No overflow issues

### Test 8: Style Changes

#### Test Text Color
**Steps:**
1. Select any text element
2. Click color picker
3. Choose red color (#FF0000)

**Expected Results:**
- ✅ Text turns red
- ✅ Color picker updates
- ✅ Hex input shows #FF0000

#### Test Background Color (Button)
**Steps:**
1. Select button
2. Change background color to green

**Expected Results:**
- ✅ Button background changes
- ✅ Text still readable
- ✅ Hover effects still work

#### Test Font Size
**Steps:**
1. Select headline
2. Change font size to "60px"

**Expected Results:**
- ✅ Text size increases
- ✅ Layout adjusts
- ✅ Still readable

#### Test Invalid Values
**Steps:**
1. Enter invalid font size: "abc"
2. Enter invalid color: "xyz"

**Expected Results:**
- ✅ Graceful handling
- ✅ Falls back to previous value
- ✅ No console errors

### Test 9: Link Management

#### Test URL Update
**Steps:**
1. Select button or link
2. Change URL to "https://google.com"
3. Click the element

**Expected Results:**
- ✅ URL updates
- ✅ Click navigates to Google
- ✅ Href attribute changed

#### Test Target Change
**Steps:**
1. Select link
2. Change "Open In" to "New Tab"
3. Click link

**Expected Results:**
- ✅ Opens in new tab
- ✅ Target attribute set to "_blank"

### Test 10: Persistence

#### Test Auto-Save
**Steps:**
1. Make several edits
2. Refresh the page
3. Enable editor mode

**Expected Results:**
- ✅ All changes preserved
- ✅ Elements show edited content
- ✅ Styles maintained

#### Test Cross-Session
**Steps:**
1. Make edits
2. Close browser completely
3. Reopen browser
4. Navigate to editor

**Expected Results:**
- ✅ Changes still there
- ✅ localStorage working

#### Test Private Mode
**Steps:**
1. Open in incognito/private window
2. Make edits
3. Close and reopen private window

**Expected Results:**
- ✅ Changes lost (expected)
- ⚠️ Warning about private mode could be added

### Test 11: Reset Functionality

#### Test Reset All
**Steps:**
1. Make multiple edits
2. Click "Reset" button
3. Confirm reset

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ After confirm, all changes revert
- ✅ Page shows original content
- ✅ localStorage cleared

#### Test Cancel Reset
**Steps:**
1. Click "Reset"
2. Click "Cancel" in dialog

**Expected Results:**
- ✅ No changes made
- ✅ Edits preserved
- ✅ Page unchanged

### Test 12: UI/UX Tests

#### Test Sidebar Toggle
**Steps:**
1. Click "Hide Sidebar"
2. Click "Show Sidebar"

**Expected Results:**
- ✅ Sidebar hides smoothly
- ✅ Sidebar shows smoothly
- ✅ Selected element preserved

#### Test Editor Mode Toggle
**Steps:**
1. Enable editor mode
2. Disable editor mode
3. Try to click elements

**Expected Results:**
- ✅ Elements not selectable when disabled
- ✅ No blue outlines when disabled
- ✅ Normal page interaction

### Test 13: Edge Cases

#### Test Long Text
**Steps:**
1. Select element
2. Paste very long text (1000+ characters)

**Expected Results:**
- ✅ Handles gracefully
- ✅ Layout doesn't break
- ✅ Scrollable if needed

#### Test Special Characters
**Steps:**
1. Enter text with: emojis, HTML, special chars
2. Check rendering

**Expected Results:**
- ✅ Characters display correctly
- ✅ No XSS vulnerabilities
- ✅ HTML escaped properly

#### Test Rapid Changes
**Steps:**
1. Type rapidly in content field
2. Change colors quickly
3. Switch elements fast

**Expected Results:**
- ✅ No lag or freezing
- ✅ All changes apply
- ✅ No errors in console

### Test 14: Browser Compatibility

Test in multiple browsers:

#### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Performance good

#### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Performance good

#### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Performance good

#### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Performance good

### Test 15: Responsive Testing

#### Desktop (1920x1080)
- [ ] Layout correct
- [ ] Editor usable
- [ ] All features work

#### Laptop (1366x768)
- [ ] Layout correct
- [ ] Sidebar fits
- [ ] No overflow

#### Tablet (768x1024)
- [ ] Responsive layout
- [ ] Touch interactions work
- [ ] Sidebar toggleable

#### Mobile (375x667)
- [ ] Mobile layout
- [ ] Editor message if too small
- [ ] Basic functionality works

## Automated Testing (Future)

### Unit Tests
```bash
# To be implemented
npm run test
```

**What to test:**
- Utility functions
- Element selector generation
- Color conversion
- Data transformations

### Integration Tests
**What to test:**
- API routes
- OAuth flows
- Data fetching
- Error handling

### E2E Tests
**Tools:** Playwright, Cypress

**What to test:**
- Complete user flows
- OAuth processes
- Editor operations
- Cross-page navigation

## Performance Testing

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Load Testing
**Check:**
- Page load time < 2s
- Time to interactive < 3s
- First contentful paint < 1s

## Security Testing

### Check for:
- [ ] No API keys in frontend code
- [ ] HTTPS in production
- [ ] OAuth flows secure
- [ ] No XSS vulnerabilities
- [ ] No CSRF issues
- [ ] Input sanitization

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected vs actual result
3. Browser/OS info
4. Console errors (if any)
5. Screenshots/videos

## Test Results Template

```
Test Date: YYYY-MM-DD
Tester: Name
Environment: Local / Production

API Integrations:
- HubSpot: ✅ Pass / ❌ Fail
- Google Ads: ✅ Pass / ❌ Fail
- Shopify: ✅ Pass / ❌ Fail
- LinkedIn Ads: ✅ Pass / ❌ Fail

Page Editor:
- Element Selection: ✅ Pass / ❌ Fail
- Content Editing: ✅ Pass / ❌ Fail
- Style Changes: ✅ Pass / ❌ Fail
- Link Management: ✅ Pass / ❌ Fail
- Persistence: ✅ Pass / ❌ Fail
- Reset: ✅ Pass / ❌ Fail

Browser Compatibility:
- Chrome: ✅ Pass / ❌ Fail
- Firefox: ✅ Pass / ❌ Fail
- Safari: ✅ Pass / ❌ Fail
- Edge: ✅ Pass / ❌ Fail

Notes:
[Any additional notes]

Issues Found:
1. [Description]
2. [Description]
```

---

Follow this guide to thoroughly test all features before deploying!

