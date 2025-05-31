import { Request, Response } from 'express';
import ProductAttributeService from '../services/ProductAttributeService';

class ProductAttributeController {
  public static async list(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.productId, 10);
      const attributes = await ProductAttributeService.getAttributes(productId);
      return res.json({ attributes });
    } catch (error) {
      console.error('ProductAttributeController.list Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.productId, 10);
      const { attrKey, attrValue } = req.body;
      const id = await ProductAttributeService.createAttribute(
        productId,
        attrKey,
        attrValue
      );
      return res
        .status(201)
        .json({ message: 'Attribute created', attributeId: id });
    } catch (error) {
      console.error('ProductAttributeController.create Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const { attrKey, attrValue } = req.body;
      await ProductAttributeService.updateAttribute(id, attrKey, attrValue);
      return res.json({ message: 'Attribute updated', attributeId: id });
    } catch (error) {
      console.error('ProductAttributeController.update Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      await ProductAttributeService.deleteAttribute(id);
      return res.json({ message: 'Attribute deleted', attributeId: id });
    } catch (error) {
      console.error('ProductAttributeController.delete Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default ProductAttributeController;