import { defineField, defineType } from 'sanity';

const localizedItemFields = [
  defineField({ name: 'name', title: 'Name', type: 'string' }),
  defineField({ name: 'summaryName', title: 'Short Name For Home Card', type: 'string' }),
  defineField({ name: 'duration', title: 'Duration', type: 'string' }),
  defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
  defineField({ name: 'note', title: 'Note', type: 'string' }),
  defineField({ name: 'regularPriceText', title: 'Regular Price Text Override', type: 'string' }),
  defineField({ name: 'campaignPriceText', title: 'Campaign Price Text Override', type: 'string' })
];

export const pricingItem = defineType({
  name: 'pricingItem',
  title: 'Pricing Item',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Item ID',
      type: 'slug',
      description: 'Stable ID used by the website, for example gel-onecolor.',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'pricingCategory' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 100
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'showOnHome',
      title: 'Show On Home Card',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'regularPrice',
      title: 'Regular Price',
      type: 'number',
      description: 'Use numbers for normal yen prices, for example 7500.'
    }),
    defineField({
      name: 'regularPriceText',
      title: 'Regular Price Text',
      type: 'string',
      description: 'Use this for ranges or special prices, for example ¥50-¥200 / piece.'
    }),
    defineField({
      name: 'campaignEnabled',
      title: 'This Item Has Campaign Price',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'campaignPrice',
      title: 'Campaign Price',
      type: 'number'
    }),
    defineField({
      name: 'campaignPriceText',
      title: 'Campaign Price Text',
      type: 'string'
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string'
    }),
    defineField({
      name: 'noteType',
      title: 'Note Type',
      type: 'string',
      options: {
        list: [
          { title: 'Free fix + campaign text', value: 'fix_campaign' },
          { title: 'Campaign text only', value: 'campaign_only' },
          { title: 'No automatic note', value: '' }
        ],
        layout: 'radio'
      },
      initialValue: 'fix_campaign'
    }),
    defineField({
      name: 'translations',
      title: 'Translations',
      type: 'object',
      fields: [
        defineField({ name: 'ja', title: 'Japanese', type: 'object', fields: localizedItemFields }),
        defineField({ name: 'en', title: 'English', type: 'object', fields: localizedItemFields }),
        defineField({ name: 'vi', title: 'Vietnamese', type: 'object', fields: localizedItemFields }),
        defineField({ name: 'zh', title: 'Chinese', type: 'object', fields: localizedItemFields }),
        defineField({ name: 'ko', title: 'Korean', type: 'object', fields: localizedItemFields }),
        defineField({ name: 'my', title: 'Myanmar', type: 'object', fields: localizedItemFields }),
        defineField({ name: 'id', title: 'Indonesian', type: 'object', fields: localizedItemFields })
      ]
    })
  ],
  preview: {
    select: {
      title: 'translations.ja.name',
      fallbackTitle: 'id.current',
      category: 'category.title',
      published: 'published'
    },
    prepare(selection) {
      return {
        title: selection.title || selection.fallbackTitle || 'Pricing Item',
        subtitle: `${selection.category || 'No category'}${selection.published === false ? ' - Draft/hidden' : ''}`
      };
    }
  }
});
