import type { Meta, StoryObj } from "@storybook/nextjs";

import MenuItem from "./menu-item";

const meta = {
  title: "Example/MenuItem",
  component: MenuItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    menuText: { control: "text" },
  },
  args: {
    menuText: "Home",
  },
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    menuText: "Dashboard",
  },
};

export const About: Story = {
  args: {
    menuText: "About Us",
  },
};

export const Contact: Story = {
  args: {
    menuText: "Contact",
  },
};
