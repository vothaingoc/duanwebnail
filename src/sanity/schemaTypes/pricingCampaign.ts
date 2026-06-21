import { defineField, defineType } from 'sanity';

export const pricingCampaign = defineType({
  name: 'pricingCampaign',
  title: 'Pricing Campaign',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Campaign Name',
      type: 'string',
      initialValue: 'Limited-time campaign'
    }),
    defineField({
      name: 'active',
      title: 'Show Campaign Prices',
      type: 'boolean',
      description: 'Turn on to show sale prices and the limited-time campaign text on the home pricing cards and detailed price table.',
      initialValue: false
    }),
    defineField({
      name: 'startsAt',
      title: 'Starts At',
      type: 'datetime',
      description: 'Optional. Leave empty to start immediately.'
    }),
    defineField({
      name: 'endsAt',
      title: 'Ends At',
      type: 'datetime',
      description: 'Optional. Leave empty if there is no end date yet.'
    })
  ],
  preview: {
    select: {
      title: 'name',
      active: 'active'
    },
    prepare(selection) {
      return {
        title: selection.title || 'Pricing Campaign',
        subtitle: selection.active ? 'Active' : 'Inactive'
      };
    }
  }
});
