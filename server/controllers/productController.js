const Product = require('../models/Product');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    // Handle sort
    let sortQuery = '-createdAt';
    if (sort === 'newest') sortQuery = '-createdAt';
    else if (sort === 'price-asc') sortQuery = 'price';
    else if (sort === 'price-desc') sortQuery = '-price';
    else if (sort === 'rating') sortQuery = '-ratings';
    else sortQuery = sort;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortQuery)
      .limit(Number(limit))
      .skip(skip)
      .select('-reviews');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'reviews.user',
      'name avatar'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    console.log('Create Product Request Body:', req.body);
    console.log('Create Product Files:', req.files);

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      // Generate image objects from uploaded files
      productData.images = req.files.map((file) => ({
        url: file.path,
        alt: req.body.alt || 'Product image',
      }));
    } else if (req.body.images) {
      // Handle URL-based images (backward compatibility)
      try {
        productData.images = typeof req.body.images === 'string'
          ? JSON.parse(req.body.images)
          : req.body.images;
      } catch (e) {
        productData.images = req.body.images;
      }
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      // Generate image objects from uploaded files
      const newImages = req.files.map((file) => ({
        url: file.path,
        alt: req.body.alt || 'Product image',
      }));

      // If there are existing images in the request, merge them
      if (req.body.existingImages) {
        try {
          const existingImages = typeof req.body.existingImages === 'string'
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
          productData.images = [...existingImages, ...newImages];
        } catch (e) {
          productData.images = newImages;
        }
      } else {
        productData.images = newImages;
      }
    } else if (req.body.images) {
      // Handle URL-based images (backward compatibility)
      try {
        productData.images = typeof req.body.images === 'string'
          ? JSON.parse(req.body.images)
          : req.body.images;
      } catch (e) {
        productData.images = req.body.images;
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Product already reviewed',
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
      .select('-reviews');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products for admin (including inactive)
// @route   GET /api/products/admin
// @access  Private/Admin
exports.getAdminProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    // Handle sort
    let sortQuery = '-createdAt';
    if (sort === 'newest') sortQuery = '-createdAt';
    else if (sort === 'price-asc') sortQuery = 'price';
    else if (sort === 'price-desc') sortQuery = '-price';
    else if (sort === 'rating') sortQuery = '-ratings';
    else sortQuery = sort;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortQuery)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
