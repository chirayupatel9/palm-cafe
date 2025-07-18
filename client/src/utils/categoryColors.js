// Category color scheme utility
const categoryColors = [
  // Primary colors with different shades
  {
    name: 'primary',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-700',
    header: 'bg-primary-100',
    hover: 'hover:bg-primary-100'
  },
  {
    name: 'secondary',
    bg: 'bg-secondary-50',
    border: 'border-secondary-200',
    text: 'text-secondary-700',
    header: 'bg-secondary-100',
    hover: 'hover:bg-secondary-100'
  },
  {
    name: 'accent',
    bg: 'bg-accent-50',
    border: 'border-accent-200',
    text: 'text-accent-700',
    header: 'bg-accent-100',
    hover: 'hover:bg-accent-100'
  },
  // Additional color variations
  {
    name: 'green',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    header: 'bg-green-100',
    hover: 'hover:bg-green-100'
  },
  {
    name: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    header: 'bg-blue-100',
    hover: 'hover:bg-blue-100'
  },
  {
    name: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    header: 'bg-purple-100',
    hover: 'hover:bg-purple-100'
  },
  {
    name: 'orange',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    header: 'bg-orange-100',
    hover: 'hover:bg-orange-100'
  },
  {
    name: 'pink',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    header: 'bg-pink-100',
    hover: 'hover:bg-pink-100'
  },
  {
    name: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    header: 'bg-indigo-100',
    hover: 'hover:bg-indigo-100'
  },
  {
    name: 'teal',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    header: 'bg-teal-100',
    hover: 'hover:bg-teal-100'
  }
];

// Get color scheme for a category based on its name or index
export const getCategoryColor = (categoryName, index = 0) => {
  if (!categoryName) {
    return categoryColors[0]; // Default to primary
  }
  
  // Use the category name to generate a consistent color
  const hash = categoryName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colorIndex = Math.abs(hash) % categoryColors.length;
  return categoryColors[colorIndex];
};

// Get color scheme by index
export const getCategoryColorByIndex = (index) => {
  return categoryColors[index % categoryColors.length];
};

// Get all available colors
export const getAllCategoryColors = () => {
  return categoryColors;
};

export default categoryColors; 