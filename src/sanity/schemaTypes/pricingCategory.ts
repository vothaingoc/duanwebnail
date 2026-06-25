import { defineField, defineType } from 'sanity';

const localizedCardFields = [
  defineField({ name: 'label', title: 'Small Label', type: 'string' }),
  defineField({ name: 'title', title: 'Title', type: 'string' }),
  defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 })
];

export const pricingCategory = defineType({
  name: 'pricingCategory',
  title: 'Pricing Category',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Key',
      type: 'slug',
      description: 'Stable key used by the website, for example gel, extension, foot, options.',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Category Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'label',
      title: 'English Label',
      type: 'string',
      description: 'Small label shown above the category title on the detailed price page.'
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 100
    }),
    defineField({
      name: 'featured',
      title: 'Featured Dark Card',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'showOnHome',
      title: 'Show On Home Pricing Cards',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'homeOrder',
      title: 'Home Card Order',
      type: 'number',
      initialValue: 100
    }),
    defineField({
      name: 'homeItems',
      title: 'Home Card Items',
      type: 'array',
      description: 'Optional. Pick the exact items to show on the home pricing card. If empty, items marked Show On Home in this category are used.',
      of: [{ type: 'reference', to: [{ type: 'pricingItem' }] }]
    }),
    defineField({
      name: 'translations',
      title: 'Translations',
      type: 'object',
      fields: [
        defineField({ name: 'ja', title: 'Japanese', type: 'object', fields: localizedCardFields }),
        defineField({ name: 'en', title: 'English', type: 'object', fields: localizedCardFields }),
        defineField({ name: 'vi', title: 'Vietnamese', type: 'object', fields: localizedCardFields }),
        defineField({ name: 'zh', title: 'Chinese', type: 'object', fields: localizedCardFields }),
        defineField({ name: 'ko', title: 'Korean', type: 'object', fields: localizedCardFields }),
        defineField({ name: 'my', title: 'Myanmar', type: 'object', fields: localizedCardFields }),
        defineField({ name: 'id', title: 'Indonesian', type: 'object', fields: localizedCardFields })
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      key: 'key.current',
      published: 'published'
    },
    prepare(selection) {
      return {
        title: selection.title || selection.key || 'Pricing Category',
        subtitle: `${selection.key || 'no-key'}${selection.published === false ? ' - Draft/hidden' : ''}`
      };
    }
  }
});
