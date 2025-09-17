const Lead = require('../models/Lead');

const createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('createLead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeads = async (req, res) => {
  let { page = 1, limit = 20 } = req.query;
  limit = Math.min(Number(limit), 100); // Enforce max limit of 100
  const filters = buildFilters(req.query);

  console.log('=== DEBUG getLeads ===');
  console.log('Authenticated user ID:', req.user.id);
  console.log('Full query:', filters);
  console.log('Filters applied:', filters);

  try {
    const total = await Lead.countDocuments(filters);
    console.log('Total leads matching query:', total);

    const leads = await Lead.find(filters)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ created_at: -1 });

    console.log('Fetched leads count:', leads.length);
    console.log('Sample lead (first one):', leads[0] ? { _id: leads[0]._id, email: leads[0].email } : 'None');
    console.log('=== END DEBUG ===');

    const response = {
      success: true,
      data: leads,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error('getLeads error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLead = async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id });
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json(lead);
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('updateLead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteLead = async (req, res) => {
  const lead = await Lead.findOneAndDelete({ _id: req.params.id });
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json({ message: 'Lead deleted' });
};

const buildFilters = (query) => {
  const filters = {};

  // String fields: equals, contains
  ['email', 'company', 'city'].forEach(field => {
    if (query[`${field}_equals`]) {
      filters[field] = query[`${field}_equals`];
    }
    if (query[`${field}_contains`]) {
      filters[field] = { $regex: query[`${field}_contains`], $options: 'i' };
    }
  });

  // Enum fields: equals, in
  ['status', 'source'].forEach(field => {
    if (query[`${field}_equals`]) {
      filters[field] = query[`${field}_equals`];
    }
    if (query[`${field}_in`]) {
      const values = query[`${field}_in`].split(',').map(v => v.trim());
      if (values.length > 0) {
        filters[field] = { $in: values };
      }
    }
  });

  // Numeric fields: equals, gt, lt, between
  ['score', 'lead_value'].forEach(field => {
    if (query[`${field}_equals`]) {
      const value = Number(query[`${field}_equals`]);
      if (!isNaN(value)) {
        filters[field] = value;
      }
    }
    ['gt', 'lt'].forEach(op => {
      if (query[`${field}_${op}`]) {
        const value = Number(query[`${field}_${op}`]);
        if (!isNaN(value)) {
          filters[field] = { ...filters[field], [`$${op}`]: value };
        }
      }
    });
    if (query[`${field}_between`]) {
      const [min, max] = query[`${field}_between`].split(',').map(Number);
      if (!isNaN(min) && !isNaN(max) && min <= max) {
        filters[field] = { $gt: min, $lt: max };
      }
    }
  });

  // Date fields: on, before, after, between
  ['created_at', 'last_activity_at'].forEach(field => {
    if (query[`${field}_on`]) {
      const dateStr = query[`${field}_on`];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        filters[field] = { $gte: start, $lte: end };
      }
    }
    if (query[`${field}_before`]) {
      const date = new Date(query[`${field}_before`]);
      if (!isNaN(date.getTime())) {
        filters[field] = { ...filters[field], $lt: date };
      }
    }
    if (query[`${field}_after`]) {
      const date = new Date(query[`${field}_after`]);
      if (!isNaN(date.getTime())) {
        filters[field] = { ...filters[field], $gt: date };
      }
    }
    if (query[`${field}_between`]) {
      const [startStr, endStr] = query[`${field}_between`].split(',');
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        filters[field] = { $gte: start, $lte: end };
      }
    }
  });

  // Boolean: equals
  if (query.is_qualified_equals !== undefined) {
    if (query.is_qualified_equals === 'true' || query.is_qualified_equals === 'false') {
      filters.is_qualified = query.is_qualified_equals === 'true';
    }
  }

  return filters;
};

module.exports = { createLead, getLeads, getLead, updateLead, deleteLead };