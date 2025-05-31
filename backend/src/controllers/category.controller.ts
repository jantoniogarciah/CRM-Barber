import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const categories = await prisma.category.findMany({
      where: showInactive ? undefined : { isActive: true },
      include: {
        services: true,
      },
    });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// Get single category
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Error fetching category" });
  }
};

// Create category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        description,
        isActive: true,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Error creating category" });
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
      },
    });
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Error updating category" });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id },
    });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Error deleting category" });
  }
};

// Toggle category status
export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        isActive: !category.isActive,
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error("Error toggling category status:", error);
    res.status(500).json({ message: "Error toggling category status" });
  }
};
