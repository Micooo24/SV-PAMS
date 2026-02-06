 const getStatusDisplay = (status) => {
    const statusMap = {
      approved: { color: '#10b981', icon: 'check-circle', text: 'Approved' },
      needs_review: { color: '#f59e0b', icon: 'alert-circle', text: 'Pending Review' },
      rejected: { color: '#ef4444', icon: 'close-circle', text: 'Rejected' },
      pending: { color: '#828282', icon: 'clock', text: 'Processing' },
    };
    return statusMap[status] || { color: '#6b7280', icon: 'help-circle', text: 'Unknown' };
  };

  export { getStatusDisplay };