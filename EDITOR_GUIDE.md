# Page Editor Guide

Complete guide to using the visual page editor.

## Features

### 1. Element Selection
Click on any highlighted element to select it for editing. Elements are automatically detected and marked with:
- Dashed blue outline on hover
- Solid blue outline when selected
- Element type label

### 2. Editable Element Types

#### Headlines (H1, H2)
- Main page titles
- Section headers
- Large, bold text

**What you can edit:**
- Text content
- Color
- Font size

#### Subheadlines (H3, H4)
- Section subtitles
- Feature descriptions
- Medium-sized text

**What you can edit:**
- Text content
- Color
- Font size

#### Body Text
- Paragraphs
- Descriptions
- Regular content text

**What you can edit:**
- Text content
- Color
- Font size

#### Buttons (CTA)
- Call-to-action buttons
- Navigation links styled as buttons

**What you can edit:**
- Button text
- Text color
- Background color
- Font size
- Link URL
- Open in new tab/same tab

#### Links
- Text hyperlinks
- Navigation elements

**What you can edit:**
- Link text
- Text color
- Link URL
- Open in new tab/same tab

## How to Use

### Starting the Editor

1. Navigate to http://localhost:3000
2. Click "Open Page Editor"
3. Click "Enable Editor Mode" in the toolbar

### Editing an Element

1. **Select**: Click on any element with a blue outline
2. **Edit**: Modify properties in the right sidebar:
   - Type text directly in the content textarea
   - Use color pickers for colors
   - Enter font sizes (e.g., "24px", "2rem")
   - Update URLs for links/buttons
3. **Preview**: Changes apply instantly to the page
4. **Save**: Changes auto-save to localStorage

### Color Editing

**Two ways to set colors:**

1. **Color Picker**: Click the colored square and select from palette
2. **Manual Entry**: Type hex code (e.g., `#FF5733`) or RGB (e.g., `rgb(255, 87, 51)`)

**Supported formats:**
- Hex: `#FF5733`
- RGB: `rgb(255, 87, 51)`
- RGBA: `rgba(255, 87, 51, 0.5)`
- Named: `red`, `blue`, `green`, etc.

### Font Size Editing

**Supported units:**
- Pixels: `16px`, `24px`
- Rems: `1rem`, `1.5rem`
- Ems: `1em`, `1.2em`
- Percentages: `100%`, `120%`

### Link/Button URLs

**For buttons and links:**
- Enter full URL: `https://example.com`
- Relative path: `/about`, `/contact`
- Hash links: `#section-id`
- Email: `mailto:hello@example.com`
- Phone: `tel:+1234567890`

**Target options:**
- Same Tab (`_self`): Opens in current window
- New Tab (`_blank`): Opens in new window

## Editor Controls

### Toolbar Buttons

**Enable/Disable Editor Mode**
- Toggles element highlighting
- Enables/disables click selection

**Show/Hide Sidebar**
- Toggles property panel visibility
- Gives more space for preview

**Reset**
- Clears all changes
- Restores original content
- Asks for confirmation

**Back to Home**
- Returns to main menu
- Changes are preserved

### Sidebar Panels

**Element Type**
- Shows selected element category
- Read-only, informational

**Content**
- Multi-line text editor
- Supports plain text
- Updates in real-time

**Text Color**
- Color picker + text input
- Applies to text/content

**Background Color**
- Color picker + text input
- Only for buttons
- Changes button background

**Font Size**
- Text input with units
- Affects text size

**Link URL**
- For buttons and links
- Full or relative URLs

**Open In**
- Dropdown selector
- Same tab or new tab

**CSS Selector**
- Shows element's unique selector
- Read-only, for reference

## Persistence

### Auto-Save
- Every change saves immediately
- No manual save button needed
- Stored in browser localStorage

### Limitations
- Changes are browser-specific
- Clearing browser data removes changes
- Private/incognito mode: changes lost on close

### Backup/Export
Currently, the editor doesn't support export. To save permanently:
1. Copy changed content manually
2. Update source files directly
3. Take screenshots for reference

## Tips & Tricks

### Best Practices

1. **Small Changes**: Edit one element at a time
2. **Preview Often**: Check how changes look
3. **Consistent Styling**: Use similar colors/fonts
4. **Test Links**: Click buttons after editing URLs
5. **Use Reset**: Start over if mistakes accumulate

### Keyboard Shortcuts

Currently no keyboard shortcuts. Future enhancements could include:
- `Ctrl+Z`: Undo
- `Ctrl+S`: Manual save
- `Escape`: Deselect element
- `Delete`: Remove element

### Mobile Editing

The editor works on tablets and desktop. For best experience:
- Use desktop browser
- Minimum screen width: 1024px
- Sidebar may overlap on smaller screens

## Advanced Usage

### Custom Selectors

The editor generates CSS selectors automatically. Understanding them helps:

**ID-based**: `#header-title`
- Most specific
- Unique per page

**Class-based**: `.hero-headline`
- Reusable styles
- May affect multiple elements

**Position-based**: `section > h2:nth-of-type(2)`
- Uses element order
- Can break if structure changes

### Inline Styles vs Classes

The editor applies **inline styles**:
- Takes highest priority
- Overrides CSS classes
- Specific to element

**Pros:**
- Works immediately
- No CSS knowledge needed
- Element-specific

**Cons:**
- Harder to maintain
- Not easily reusable
- Can conflict with responsive design

## Troubleshooting

### Element Won't Select
**Possible causes:**
- Editor mode not enabled
- Element not marked as editable
- Click captured by child element

**Solutions:**
- Toggle editor mode off/on
- Click directly on text, not padding
- Check console for errors

### Changes Not Saving
**Possible causes:**
- LocalStorage disabled
- Browser in private mode
- Storage quota exceeded

**Solutions:**
- Enable localStorage in browser
- Use regular browsing mode
- Clear old localStorage data

### Styles Not Applying
**Possible causes:**
- Invalid color/size format
- CSS specificity conflict
- Important flags in stylesheets

**Solutions:**
- Use valid CSS values
- Check format (px, rem, #hex)
- Inspect element in DevTools

### Colors Look Different
**Possible causes:**
- RGB vs Hex conversion
- Transparent backgrounds
- Parent element styles

**Solutions:**
- Use same color format consistently
- Check background inheritance
- Test with solid colors first

## Extending the Editor

### Adding New Element Types

To support new element types (e.g., images):

1. Update `EditableElement` type in `lib/editor-utils.ts`
2. Add new properties to element data structure
3. Update `DemoPage` component to mark elements
4. Add UI controls in sidebar

### Custom Properties

To add new editable properties:

1. Add to `EditableElement` interface
2. Create input in sidebar panel
3. Add handler function
4. Update `applyElementChanges` function

### Integration with CMS

To save changes to a database:

1. Replace localStorage with API calls
2. Create backend endpoints
3. Store element data as JSON
4. Load on page mount

## Demo Page Structure

The included demo page has:
- Hero section with headline, subheadline, CTA
- Features section with 3 columns
- CTA section with button

All elements are pre-configured as editable.

## Limitations

Current version does not support:
- Image editing
- Adding/removing elements
- Layout changes
- Drag-and-drop
- Undo/redo
- Multi-select
- Copy/paste
- Export to HTML

These could be added in future versions.

## Performance

The editor is optimized for:
- Pages with < 100 editable elements
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Desktop/tablet viewports

For larger pages:
- Limit editable elements
- Use virtualization
- Implement lazy loading

## Security Considerations

- Editor works client-side only
- No server-side rendering needed
- Changes stored locally
- No external requests

For production:
- Add authentication
- Validate changes server-side
- Sanitize user input
- Rate-limit API calls

## Next Steps

1. Try editing the demo page
2. Customize colors to match your brand
3. Update CTA text and links
4. Add your own content
5. Build additional editable pages

---

Need help? Check the main [README.md](./README.md) or open an issue.

