const categorySchema = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'ID (slug)',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'icon',
      title: 'FontAwesome Icon Class',
      type: 'string',
    },
    {
      name: 'name_en',
      title: 'Name (English)',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'name_ar',
      title: 'Name (Arabic)',
      type: 'string',
    },
    {
      name: 'name_fr',
      title: 'Name (French)',
      type: 'string',
    },
    {
      name: 'name_de',
      title: 'Name (German)',
      type: 'string',
    },
    {
      name: 'order',
      title: 'Sort Order',
      type: 'number',
    }
  ]
};

const menuItemSchema = {
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'ID (slug)',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'category',
      title: 'Category ID',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'subgroup',
      title: 'Subgroup',
      type: 'string',
    },
    {
      name: 'price',
      title: 'Price (Number)',
      type: 'number',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'price_label',
      title: 'Price Label (e.g. 199 ETB)',
      type: 'string',
    },
    {
      name: 'calories',
      title: 'Calories',
      type: 'string',
    },
    {
      name: 'type',
      title: 'Type (veg/non-veg)',
      type: 'string',
      options: {
        list: ['veg', 'non-veg']
      }
    },
    {
      name: 'is_4d',
      title: 'Is 4D Experience?',
      type: 'boolean',
    },
    {
      name: 'title_en',
      title: 'Title (English)',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'title_ar',
      title: 'Title (Arabic)',
      type: 'string',
    },
    {
      name: 'title_fr',
      title: 'Title (French)',
      type: 'string',
    },
    {
      name: 'title_de',
      title: 'Title (German)',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'description_en',
      title: 'Description (English)',
      type: 'text',
    },
    {
      name: 'ingredients',
      title: 'Ingredients JSON (Internal)',
      type: 'text',
    },
    {
      name: 'stock',
      title: 'Stock Status',
      type: 'string',
      options: { list: ['available', 'few', 'out'] }
    },
    {
      name: 'offer',
      title: 'Discount Offer (%)',
      type: 'number',
    },
    {
      name: 'badges',
      title: 'Badges',
      type: 'array',
      of: [{type: 'string'}]
    },
  ],
  preview: {
    select: {
      title: 'title_en',
      subtitle: 'category',
      media: 'image',
    }
  }
};

export const schemaTypes = [categorySchema, menuItemSchema];
