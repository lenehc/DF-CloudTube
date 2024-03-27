// FILTERS START
// FILTERS END

const baseRules = {
    channelName: (obj) => {
        let h = obj.querySelector('.author');
        if (h) return h.textContent.trim();
    },
    channelId: (obj) => {
        let h = obj.querySelector('.author');
        if (h) return h.getAttribute('href').split('/').pop();
    },
    videoTitle: (obj) => {
        let h = obj.querySelector('.title-link');
        if (h) return h.textContent.trim();
    }
}

const filterMatches = {
    '^search': {
        '.search-result': baseRules
    },
    '^channel': {
        '.channel-video': baseRules,
        'main': {
            channelName: '.channel-data .name',
            channelId: () => {locationPath.split('/').pop()}
        }
    }
}

const locationPath = window.location.pathname.replace(/^\//, '');

class MutationsFilter {
    constructor(filters) {
        this.filters = filters;
    }

    filter(mutations) {
        mutations.forEach((m) => {
            m.addedNodes.forEach((n) => {
                if (this.matchFilters(n)) {
                    n.remove();
                }
            })
        })
    }

    matchFilters(obj) {
        return Object.keys(this.filters).some((path) => {
            let filterRules = this.filters[path];
            return obj.nodeType === 1 && obj.matches(path) && this.matchFilterRules(filterRules, obj)
        })
    }

    matchFilterRules(filterRules, obj) {
        return Object.keys(filterRules).some((e) => {
            let value = filterRules[e];
            if (typeof value == 'function') {
                value = value(obj);
            }
            else {
                value = obj.querySelector(value).textContent;
            }
            return filterData[e].some(p => p.test(value));
        })
    }
}

Object.keys(filterMatches).forEach((e) => {
    if (new RegExp(e).test(locationPath)) {
        filterObj = new MutationsFilter(filterMatches[e])
    }
});

const observer = new MutationObserver((mutations) => filterObj.filter(mutations));
observer.observe(document, { childList: true, subtree: true });
