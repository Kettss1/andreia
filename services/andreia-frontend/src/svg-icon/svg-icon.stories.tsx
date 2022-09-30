import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import SvgIcon from './svg-icon';

export default {
    title: 'Element/SvgIcon',
    component: SvgIcon
} as ComponentMeta<typeof SvgIcon>;

const Template: ComponentStory<typeof SvgIcon> = ({ url }) => <SvgIcon url={url} />;

export const Default = {
    render: Template.bind({}),
    storyName: 'default',
    args: {
        url: ''
    }
}