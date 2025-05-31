import { Request, Response } from 'express';
import ProductService from '../services/ProductService';
import { fileUrl } from '../utils/url';

class ProductController {
  public static async create(req: Request, res: Response) {
    try {
      const {
        name,
        category,
        description,
        priceType,
        destinationPort,
        orderQuantity,
        attributes
      } = req.body;
      const imagePath = req.file ? req.file.path : null;
      const attrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;

      const id = await ProductService.createProduct(
        name,
        category,
        description || null,
        priceType,
        destinationPort || null,
        orderQuantity ?? null,
        attrs || {},
        imagePath ? [imagePath] : []
      );

      return res.status(201).json({ message: 'Product created', productId: id });
    } catch (error) {
      console.error('ProductController.create Error:', error);
      return res.status(500).json({ message: error});
    }
  }

  public static async getAll(req: Request, res: Response) {
    try {
      const list = await ProductService.getAll();
      const products = list.map((p) => ({
        ...p,
        images: (p.images || []).map((img: string) =>
          fileUrl(req.protocol, req.get('host') || '', img)
        )
      }));
      return res.json({ products });
    } catch (error) {
      console.error('ProductController.getAll Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await ProductService.getById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      product.images = (product.images || []).map((img: string) =>
        fileUrl(req.protocol, req.get('host') || '', img)
      );
      return res.json({ product });
    } catch (error) {
      console.error('ProductController.getById Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const {
        name,
        category,
        description,
        priceType,
        destinationPort,
        orderQuantity,
        attributes
      } = req.body;
      const imagePath = req.file ? req.file.path : null;
      const attrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;

      await ProductService.updateProduct(
        id,
        name,
        category,
        description || null,
        priceType,
        destinationPort || null,
        orderQuantity ?? null,
        attrs || {},
        imagePath ? [imagePath] : []
      );

      return res.json({ message: 'Product updated', productId: id });
    } catch (error) {
      console.error('ProductController.update Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      await ProductService.deleteProduct(id);
      return res.json({ message: 'Product deleted', productId: id });
    } catch (error) {
      console.error('ProductController.delete Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default ProductController;