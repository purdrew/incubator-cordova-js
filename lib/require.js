/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License') you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var require
var define

(function () {
    var modules = {}
    
    //--------------------------------------------------------------------------
    // someone else defined "define" and "require", so leave
    //--------------------------------------------------------------------------
    if (typeof define  !== 'undefined') return
    if (typeof require !== 'undefined') return

    //--------------------------------------------------------------------------
    function hop(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property)
    }

    //--------------------------------------------------------------------------
    function build(module) {
        var factory = module.factory
        
        module.exports = {}
        delete module.factory
        
        var modRequire = getRequire(module)
        factory(modRequire, module.exports, module)
        
        return module.exports
    }

    //--------------------------------------------------------------------------
    function getRequire(parentModule) {
        return function require(id) {
            return requireResolved(parentModule, id)
        }
    }

    //--------------------------------------------------------------------------
    function requireResolved(parentModule, id) {
        normalizedId = normalize(parentModule.id, id)
        
        if (!hop(modules, normalizedId)) {
            throw 'module "' + normalizedId + '" not found'
        }
        
        id = normalizedId
        return modules[id].factory ? build(modules[id]) : modules[id].exports
    }

    //--------------------------------------------------------------------------
    function normalize(parentModuleId, id) {
    
        // only need to interpret path if it starts with "."
        if (id[0] != '.') return id
    
        // build the full combined path
        var path = (parentModuleId == "") ? id : parentModuleId + "/../" + id
        
        // interpret the "." and ".." bits of the path
        var pathParts   = path.split('/')
        var resultParts = []
        
        for (var i=0; i<pathParts.length; i++) {
            var pathPart = pathParts[i]
            
            if (pathPart == '.') {
            }
            
            else if (pathPart == '..') {
                if (resultParts.length > 0) {
                    resultParts.pop()
                }
                else {
                    throw 'module "' + id + '" not found, too many .."s'
                }
            }
            
            else {
                resultParts.push(pathPart)
            }
        }
        
        return resultParts.join('/')
    }

    //--------------------------------------------------------------------------
    require = getRequire({
        id:      '',
        exports: {}
    })

    //--------------------------------------------------------------------------
    define = function (id, factory) {
        if (hop(modules, id)) {
            throw 'module "' + id + '" already defined'
        }

        modules[id] = {
            id:      id,
            factory: factory
        }
    }

    //--------------------------------------------------------------------------
    define.remove = function (id) {
        delete modules[id]
    }

})()

//------------------------------------------------------------------------------
// export for use in node
//------------------------------------------------------------------------------
if (typeof module === 'object' && typeof require === 'function') {
    module.exports.require = require
    module.exports.define  = define
}
